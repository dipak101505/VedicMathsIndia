import json
import urllib.request
import urllib.parse
import logging
import os

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    AWS Lambda function to generate IIT JEE level questions based on transcript content
    """
    try:
        # Get API key from environment variables
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'GEMINI_API_KEY environment variable not set'})
            }

        # Gemini API endpoint
        api_url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"
        
        # Headers for Gemini API
        headers = {
            'Content-Type': 'application/json',
        }

        # Get video ID from event
        video_id = event.get('video_id')
        if not video_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'video_id is required'})
            }

        # Step 1: Get Transcript
        # Construct YouTube URL and encode it
        youtube_url = f'https://www.youtube.com/{video_id}'
        encoded_url = urllib.parse.quote(youtube_url)
        transcript_api_url = f'https://apiv2.anthiago.com/transcript?get_video={encoded_url}&codeL=en'
        
        req = urllib.request.Request(
            transcript_api_url,
            headers={
                'Referer': 'https://anthiago.com/desgrabador/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        )

        logger.info("YouTube URL: %s", youtube_url)
        logger.info("Request URL: %s", req.full_url)
        
        try:
            with urllib.request.urlopen(req) as response:
                if response.status != 200:
                    raise Exception(f"Transcript API error: {response.status}")
                
                # Read and decode the response
                response_data = response.read().decode('utf-8')
                logger.info("Raw transcript response: %s", response_data[:500])  # Log first 500 chars
                
                # The API returns plain text transcript, not JSON
                documents = response_data
                logger.info("Content data retrieved successfully")
        except urllib.error.HTTPError as e:
            error_msg = f"Transcript API HTTP Error: {e.code} - {e.reason}. Video ID: {video_id} might not exist or have captions available."
            logger.error(error_msg)
            return {
                'statusCode': 404,
                'body': json.dumps({
                    'error': error_msg,
                    'video_id': video_id,
                    'youtube_url': youtube_url,
                    'suggested_action': 'Check if the video exists and has captions available'
                })
            }

        # Step 2: Generate Questions using Gemini API
        query = """Based on the provided educational content, generate exactly 20 medium difficulty multiple choice questions suitable for IIT JEE aspirants. Follow this EXACT format:

Q.{number} {question_text}\\

A)  {option_1}\\
B)  {option_2}\\
C)  {option_3}\\
D)  {option_4}\\

Answer: {correct_option}\\

Solution: {solution_text}\\

FORMATTING REQUIREMENTS:
1. Each line MUST end with \\
2. Use capital letters A), B), C), D) for options with two spaces after the parenthesis
3. Mathematical expressions should use $ symbols for KaTeX formatting (e.g., $x^2$, $\\frac{1}{2}$)
4. Variables should be italicized with asterisks (e.g., *v* for velocity, *F* for force)
5. Answer format: "Answer: X\\" where X is the correct option letter
6. Solution should be clear and educational
7. Questions should cover key physics/chemistry/mathematics concepts
8. Maintain consistent spacing and formatting

Example format:
Q.1 Two strings of copper are stretched to the same tension. If their cross-section areas are in the ratio $1:4$, then respective wave velocities will be:\\

A)  $4:1$\\
B)  $2:1$\\
C)  $1:2$\\
D)  $1:4$\\

Answer: C\\

Solution: Wave velocity in a string is given by $v = \\sqrt{\\frac{T}{\\mu}}$ where $T$ is tension and $\\mu$ is linear mass density. Since $\\mu = \\frac{m}{l} = \\frac{\\rho A l}{l} = \\rho A$, we have $v \\propto \\frac{1}{\\sqrt{A}}$. Therefore, $\\frac{v_1}{v_2} = \\sqrt{\\frac{A_2}{A_1}} = \\sqrt{\\frac{4}{1}} = \\frac{2}{1} = 1:2$.\\

Generate 20 questions following this exact format."""

        # Combine content and query
        combined_text = documents + " " + query
        
        # Prepare data for Gemini API
        parts = [{"text": combined_text}]
        data = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 8192,
            }
        }

        json_data = json.dumps(data).encode('utf-8')
        logger.info("Sending data to Gemini API")

        # Make request to Gemini API
        params = urllib.parse.urlencode({'key': api_key})
        full_url = f"{api_url}?{params}"

        req = urllib.request.Request(full_url, data=json_data, headers=headers, method='POST')
        
        with urllib.request.urlopen(req) as response:
            body = response.read().decode('utf-8')
            logger.info("Received response from Gemini API")

            # Parse the JSON response
            response_json = json.loads(body)
            
            # Extract the generated content
            if (
                "candidates" in response_json and
                len(response_json["candidates"]) > 0 and
                "content" in response_json["candidates"][0] and
                "parts" in response_json["candidates"][0]["content"] and
                len(response_json["candidates"][0]["content"]["parts"]) > 0 and
                "text" in response_json["candidates"][0]["content"]["parts"][0]
            ):
                generated_questions = response_json["candidates"][0]["content"]["parts"][0]["text"]
                logger.info("Questions generated successfully")
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS'
                    },
                    'body': json.dumps({
                        'success': True,
                        'questions': generated_questions,
                        'video_id': video_id
                    })
                }
            else:
                error_message = "Error: Content not found in Gemini API response."
                logger.error(error_message)
                return {
                    'statusCode': 500,
                    'body': json.dumps({'error': error_message})
                }

    except urllib.error.HTTPError as e:
        error_message = f"HTTP Error: {e.code} - {e.reason}"
        logger.error(error_message)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': error_message})
        }
    
    except urllib.error.URLError as e:
        error_message = f"URL Error: {e.reason}"
        logger.error(error_message)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': error_message})
        }
    
    except json.JSONDecodeError as e:
        error_message = f"JSON Decode Error: {str(e)}"
        logger.error(error_message)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': error_message})
        }
    
    except Exception as e:
        error_message = f"Unexpected error: {str(e)}"
        logger.error(error_message)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': error_message})
        }



# Test function for local development
def test_locally():
    """
    Test function for local development
    """
    test_event = {
        'video_id': 'qn4dMXyUn1Q'
    }
    
    # Mock context for testing
    class MockContext:
        def __init__(self):
            self.function_name = 'test_function'
            self.aws_request_id = 'test_request_id'
    
    context = MockContext()
    
    # Set environment variable for testing
    os.environ['GEMINI_API_KEY'] = 'your_api_key_here'
    
    result = lambda_handler(test_event, context)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_locally()