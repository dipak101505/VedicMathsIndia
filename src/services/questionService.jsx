import {
  PutCommand,
  QueryCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDB, ddbClient, auth } from "../firebase/config";

/**
 * Question Service Module
 *
 * Service Hierarchy:
 * ├── Table Management
 * │   ├── ensureExamTableExists
 * │   ├── ensureExamTablesExist
 * │   └── ensureTopicsTable
 * │
 * ├── Question Management
 * │   ├── saveQuestion
 * │   ├── getExamQuestions
 * │   ├── getQuestionById
 * │   ├── deleteQuestion
 * │   └── Query Functions
 * │       ├── getExamQuestionsByTopic
 * │       ├── getExamQuestionsByDifficulty
 * │       └── getExamQuestionsByTopicAndDifficulty
 * │
 * ├── Topic Management
 * │   ├── getTopics
 * │   ├── addTopic
 * │   ├── addOrUpdateTopic
 * │   └── incrementTopicQuestionCount
 * │
 * ├── Exam Management
 * │   ├── addExam
 * │   ├── getExams
 * │   ├── getExam
 * │   └── deleteExam
 * │
 * └── Result Management
 *     ├── saveExamResult
 *     ├── getUserExamResults
 *     ├── getExamResults
 *     ├── getUserExamResult
 *     └── deleteExamResult
 */

/**
 * Question Service Module
 *
 * Service Hierarchy:
 * ├── Table Management
 * │   ├── ensureExamTableExists
 * │   ├── ensureExamTablesExist
 * │   └── ensureTopicsTable
 * │
 * ├── Question Management
 * │   ├── saveQuestion
 * │   ├── getExamQuestions
 * │   ├── getQuestionById
 * │   ├── deleteQuestion
 * │   └── Query Functions
 * │       ├── getExamQuestionsByTopic
 * │       ├── getExamQuestionsByDifficulty
 * │       └── getExamQuestionsByTopicAndDifficulty
 * │
 * ├── Topic Management
 * │   ├── getTopics
 * │   ├── addTopic
 * │   ├── addOrUpdateTopic
 * │   └── incrementTopicQuestionCount
 * │
 * ├── Exam Management
 * │   ├── addExam
 * │   ├── getExams
 * │   ├── getExam
 * │   └── deleteExam
 * │
 * └── Result Management
 *     ├── saveExamResult
 *     ├── getUserExamResults
 *     ├── getExamResults
 *     ├── getUserExamResult
 *     └── deleteExamResult
 */

// Cache to store exam data
let examsCache = {
  data: null,
  timestamp: 0,
  expiryTime: 500 * 60 * 1000 // 500 minutes in milliseconds
};

const cleanListOfMaps = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    if (typeof item === "object") {
      return Object.fromEntries(
        Object.entries(item).filter(([_, value]) => value !== undefined),
      );
    }
    return item;
  });
};

export const saveQuestion = async (examId, question) => {
  // Clean and transform lists
  const cleanQuestion = {
    ...question,
    contents: cleanListOfMaps(question.contents || []),
    options: (question.options || []).map((option) => ({
      ...option,
      contents: cleanListOfMaps(option.contents || []),
    })),
    solutionContent: cleanListOfMaps(question.solutionContent || []),
    metadata: {
      ...question.metadata,
      topic: question.metadata.topic || "",
      difficulty: question.metadata.difficulty || "medium",
      marks: question.metadata.marks || { correct: 4, incorrect: -1 },
    },
  };

  const command = new PutCommand({
    TableName: "ExamQuestions",
    Item: {
      PK: `QUESTION#${question.id}`,
      SK: " ",
      ...cleanQuestion,
      GSI1PK: `TOPIC#${cleanQuestion.metadata.topic}`,
      GSI1SK: `QUESTION#${question.id}`,
      GSI2PK: `DIFFICULTY#${cleanQuestion.metadata.difficulty}`,
      GSI2SK: `QUESTION#${question.id}`,
    },
  });

  try {
    await dynamoDB.send(command);
    await saveExamQuestion(examId, cleanQuestion, "add");
  } catch (error) {
    console.error("Error in saveQuestion:", error);
    throw error;
  }
};

const updateQuestionsList = (existingQuestions, question, status) => {

  if (status === "add") {
    return existingQuestions.includes(question.id)
      ? existingQuestions
      : [...existingQuestions, question.id];
  } else if (status === "rm") {
    return existingQuestions.filter((id) => id !== question);
  }
  return existingQuestions;
};
export const saveExamQuestion = async (examId, question, status) => {
  const getExamParams = {
    TableName: "Exams",
    Key: {
      PK: "EXAM#ALL",
      SK: `EXAM#${examId}`,
    },
  };

  const existingExam = await dynamoDB.send(new GetCommand(getExamParams));

  if (!existingExam.Item) {
    throw new Error(`Exam ${examId} not found`);
  }

  const existingQuestions = existingExam.Item?.questions || [];
  const updatedQuestions = updateQuestionsList(
    existingQuestions,
    question,
    status,
  );

  const updateParams = {
    TableName: "Exams",
    Key: {
      PK: "EXAM#ALL",
      SK: `EXAM#${examId}`,
    },
    UpdateExpression: "SET questions = :questions, examMetadata = :metadata",
    ExpressionAttributeValues: {
      ":questions": updatedQuestions,
      ":metadata": {
        ...existingExam.Item.examMetadata,
        updatedAt: new Date().toISOString(),
        questionCount: updatedQuestions.length,
      },
    },
  };

  await dynamoDB.send(new UpdateCommand(updateParams));

  if (status === "add") {
    await addOrUpdateTopic(question.metadata.topic);
  }
};

export const getExamQuestions = async (examId) => {
  // First, get the exam to retrieve its question IDs
  const examParams = {
    TableName: "Exams",
    Key: {
      PK: "EXAM#ALL",
      SK: `EXAM#${examId}`,
    },
  };
  const examResponse = await dynamoDB.send(new GetCommand(examParams));
  const questionIds = examResponse.Item?.questions || [];
  const contents = examResponse.Item?.content || [];
  // Fetch all questions for this exam
  const questions = await Promise.all(
    questionIds.map(async (questionId) => {
      const questionParams = {
        TableName: "ExamQuestions",
        Key: {
          PK: `QUESTION#${questionId}`,
          SK: " ",
        },
      };
      const response = await dynamoDB.send(new GetCommand(questionParams));
      return response.Item;
    }),
  );
  
  return {questions, contents};
};

export const getTopics = async () => {
  try {
    const params = {
      TableName: "Topics",
      ProjectionExpression: "topicName, questionCount, createdAt",
    };

    const response = await dynamoDB.send(new ScanCommand(params));

    if (!response.Items || response.Items.length === 0) {
      return [];
    }

    return response.Items;
  } catch (error) {
    console.error("Error fetching topics:", error);
    throw error;
  }
};

const addOrUpdateTopic = async (topicName) => {
  try {
    const existingTopics = await getTopics();
    const existingTopic = existingTopics.find((t) => t.topicName === topicName);

    if (existingTopic) {
      const params = {
        TableName: "Topics",
        Key: {
          PK: `TOPIC#${topicName}`,
          createdAt: existingTopic.createdAt,
        },
        UpdateExpression:
          "SET questionCount = if_not_exists(questionCount, :start) + :inc",
        ExpressionAttributeValues: {
          ":inc": 1,
          ":start": 0,
        },
        ReturnValues: "ALL_NEW",
      };

      return await ddbClient.send(new UpdateCommand(params));
    } else {
      return await addTopic(topicName);
    }
  } catch (error) {
    console.error("Error in addOrUpdateTopic:", error);
    throw error;
  }
};

export const addTopic = async (topicName) => {
  try {
    // check if topic already exists
    const existingTopics = await getTopics();
    if (existingTopics.some((t) => t.topicName === topicName)) {
      console.warn(`Topic ${topicName} already exists`);
      return null;
    }
    const params = {
      TableName: "Topics",
      Item: {
        PK: `TOPIC#${topicName}`,
        topicName,
        questionCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ConditionExpression: "attribute_not_exists(PK)",
    };

    await dynamoDB.send(new PutCommand(params));
    return params.Item;
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      console.warn(`Topic ${topicName} already exists`);
      return null;
    }
    console.error("Error adding topic:", error);
    throw error;
  }
};

export const incrementTopicQuestionCount = async (topicName) => {
  try {
    const params = {
      TableName: "Topics",
      Key: { PK: `TOPIC#${topicName}` },
      UpdateExpression:
        "SET questionCount = questionCount + :inc, updatedAt = :now",
      ExpressionAttributeValues: {
        ":inc": 1,
        ":now": new Date().toISOString(),
      },
    };

    await dynamoDB.send(new UpdateCommand(params));
  } catch (error) {
    console.error("Error incrementing topic question count:", error);
    throw error;
  }
};

// Other methods remain mostly the same, just update table names and query logic
export const getExamQuestionsByTopic = async (topic) => {
  const params = {
    TableName: "ExamQuestions",
    IndexName: "TopicIndex",
    KeyConditionExpression: "GSI1PK = :tp",
    ExpressionAttributeValues: {
      ":tp": `TOPIC#${topic}`,
    },
  };
  const response = await dynamoDB.send(new QueryCommand(params));
  return response.Items;
};

export const getExamQuestionsByDifficulty = async (difficulty) => {
  const params = {
    TableName: "ExamQuestions",
    IndexName: "DifficultyIndex",
    KeyConditionExpression: "GSI2PK = :df",
    ExpressionAttributeValues: {
      ":df": `DIFFICULTY#${difficulty}`,
    },
  };
  const response = await dynamoDB.send(new QueryCommand(params));
  return response.Items;
};

export const getExamQuestionsByTopicAndDifficulty = async (
  topic,
  difficulty,
) => {
  try {
    const params = {
      TableName: "ExamQuestions",
      IndexName: "TopicIndex",
      KeyConditionExpression: "GSI1PK = :topic",
      FilterExpression: "GSI2PK = :difficulty",
      ExpressionAttributeValues: {
        ":topic": `TOPIC#${topic}`,
        ":difficulty": `DIFFICULTY#${difficulty}`,
      },
    };

    const response = await dynamoDB.send(new QueryCommand(params));

    return response.Items.map((item) => ({
      id: item.PK.split("#")[1],
      contents: item.contents,
      options: item.options,
      metadata: item.metadata,
      correctAnswer: item.correctAnswer,
    }));
  } catch (error) {
    console.error("Error fetching questions by topic and difficulty:", error);
    throw error;
  }
};

export const getQuestionById = async (examId, questionId) => {
  const params = {
    TableName: "ExamQuestions",
    Key: {
      PK: `QUESTION#${questionId}`,
      SK: " ",
    },
  };
  const response = await dynamoDB.send(new GetCommand(params));
  return response.Item;
};

export const deleteQuestion = async (examId, questionId) => {
  try {
    // First get the exam to retrieve its questions array
    const getExamParams = {
      TableName: "Exams",
      Key: {
        PK: "EXAM#ALL",
        SK: `EXAM#${examId}`,
      },
    };

    const examResponse = await dynamoDB.send(new GetCommand(getExamParams));

    if (!examResponse.Item) {
      throw new Error(`Exam ${examId} not found`);
    }

    // Remove questionId from questions array
    const updatedQuestions = (examResponse.Item.questions || []).filter(
      (id) => id !== questionId,
    );

    // Update exam with new questions array
    const updateExamParams = {
      TableName: "Exams",
      Key: {
        PK: "EXAM#ALL",
        SK: `EXAM#${examId}`,
      },
      UpdateExpression:
        "SET questions = :questions, examMetadata.questionCount = :count",
      ExpressionAttributeValues: {
        ":questions": updatedQuestions,
        ":count": updatedQuestions.length,
      },
    };

    // Delete from ExamQuestions table
    const deleteQuestionParams = {
      TableName: "ExamQuestions",
      Key: {
        PK: `QUESTION#${questionId}`,
        SK: " ",
      },
    };

    // Execute both operations
    await Promise.all([
      dynamoDB.send(new UpdateCommand(updateExamParams)),
      dynamoDB.send(new DeleteCommand(deleteQuestionParams)),
    ]);

    console.log("Question deleted successfully");
  } catch (error) {
    console.error("Error in deleteQuestion:", error);
    throw error;
  }
};

// Other methods like saveExamResult, getUserExamResults remain the same
/**
 * Saves an exam result for a user
 * @async
 * @param {string} userId - ID of the user
 * @param {string} examId - ID of the exam
 * @param {Object} resultData - Exam result data
 * @returns {Promise<void>}
 * @throws {Error} If saving fails
 */
export const saveExamResult = async (userId, examId, resultData) => {
  const serializedData = {
    ...resultData,
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Get the current user's email directly from Firebase
  const userEmail = auth.currentUser?.email || userId;
  
  const params = {
    TableName: "examResults",
    Item: {
      PK: `USER#${userEmail}`,
      SK: `EXAM#${examId}`,
      GSI1PK: `EXAM#${examId}`,
      GSI1SK: serializedData.submittedAt,
      userId,
      examId,
      ...serializedData,
    },
  };

  await dynamoDB.send(new PutCommand(params));
  
  // Update exam cache to reflect this submission
  if (examsCache.data) {
    const examIndex = examsCache.data.findIndex(exam => exam.id === examId);
    if (examIndex !== -1) {
      // Mark as potentially having a submission in the cache
      // We don't have the full user context here, so we just note that someone submitted
      examsCache.data[examIndex].hasSubmissions = true;
    }
  }
  
  // Update the student's coins only if submitted within exam time + 2 days
  try {
    // Get the exam to check its time
    const examParams = {
      TableName: "Exams",
      Key: {
        PK: "EXAM#ALL",
        SK: `EXAM#${examId}`,
      },
    };
    
    const examResponse = await dynamoDB.send(new GetCommand(examParams));
    
    if (examResponse.Item) {
      const examTime = new Date(examResponse.Item?.date || examResponse.Item.createdAt);
      const submittedTime = new Date(serializedData.submittedAt);
      
      // Add 2 days to exam time
      const gracePeriod = new Date(examTime);
      gracePeriod.setDate(gracePeriod.getDate() + 2);
      
      // Only increment coins if submitted before the grace period ends
      if (submittedTime <= gracePeriod) {
        const updateParams = {
          TableName: "Students",
          Key: {
            PK: "STUDENT#ALL",
            SK: `STUDENT#${userEmail}`,
          },
          UpdateExpression: "SET coins = if_not_exists(coins, :zero) + :reward",
          ExpressionAttributeValues: {
            ":zero": 0,
            ":reward": 100,
          },
        };
        
        await dynamoDB.send(new UpdateCommand(updateParams));
        console.log("Student coins incremented successfully");
      } else {
        console.log("Exam submitted after grace period, coins not awarded");
      }
    }
  } catch (error) {
    console.error("Error updating student coins:", error);
  }
};

/**
 * Gets a specific exam result for a user
 * @async
 * @param {string} userId - ID of the user
 * @param {string} examId - ID of the exam
 * @returns {Promise<Object>} Exam result object
 * @throws {Error} If fetching fails
 */
export const getUserExamResult = async (userId, examId) => {
  // Get the current user's email directly from Firebase
  const userEmail = auth.currentUser?.email || userId;
  
  const params = {
    TableName: "examResults",
    Key: {
      PK: `USER#${userEmail}`,
      SK: `EXAM#${examId}`,
    },
  };

  const response = await dynamoDB.send(new GetCommand(params));
  return response.Item;
};

/**
 * Batch gets multiple exam results for a user
 * @async
 * @param {string} userId - ID of the user
 * @param {Array<string>} examIds - Array of exam IDs to check
 * @returns {Promise<Object>} Object mapping exam IDs to result objects
 * @throws {Error} If fetching fails
 */
export const batchGetUserExamResults = async (userId, examIds) => {
  if (!examIds || examIds.length === 0) {
    return {};
  }
  
  // Get the current user's email directly from Firebase
  const userEmail = auth.currentUser?.email || userId;
  
  // We need to make a query rather than a batch get because DynamoDB batch get
  // requires the full primary key, and we're using a composite key
  const params = {
    TableName: "examResults",
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: {
      ":pk": `USER#${userEmail}`,
    },
  };

  try {
    const response = await dynamoDB.send(new QueryCommand(params));
    
    // Filter to only the requested exam IDs and create a map for quick lookup
    const resultsMap = {};
    const items = response.Items || [];
    
    for (const examId of examIds) {
      const result = items.find(item => item.SK === `EXAM#${examId}`);
      if (result) {
        resultsMap[examId] = result;
      }
    }
    
    return resultsMap;
  } catch (error) {
    console.error("Error batch getting user exam results:", error);
    return {};
  }
};

/**
 * Retrieves exam results for a specific user
 * @async
 * @param {string} userId - ID of the user
 * @returns {Promise<Array>} Array of exam results
 * @throws {Error} If fetching fails
 */
export const getUserExamResults = async (userId) => {
  // Get the current user's email directly from Firebase
  const userEmail = auth.currentUser?.email || userId;
  
  const params = {
    TableName: "examResults",
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: {
      ":pk": `USER#${userEmail}`,
    },
  };

  const response = await dynamoDB.send(new QueryCommand(params));
  return response.Items;
};

/**
 * Gets results for a specific exam
 * @async
 * @param {string} examId - ID of the exam
 * @returns {Promise<Array>} Array of exam results
 * @throws {Error} If fetching fails
 */
export const getExamResults = async (examId) => {
  const params = {
    TableName: "examResults",
    IndexName: "ExamIndex",
    KeyConditionExpression: "GSI1PK = :examId",
    ExpressionAttributeValues: {
      ":examId": `EXAM#${examId}`,
    },
  };

  const response = await dynamoDB.send(new QueryCommand(params));
  return response.Items;
};

/**
 * Deletes an exam result for a specific user
 * @async
 * @param {string} userId - ID of the user
 * @param {string} examId - ID of the exam
 * @returns {Promise<Object>} Object containing deleted exam result details
 * @throws {Error} If deletion fails
 */
export const deleteExamResult = async (userId, examId) => {
  try {
    debugger;
    // Get the current user's email directly from Firebase
    const userEmail = auth.currentUser?.email || userId;
    
    const params = {
      TableName: "examResults",
      Key: {
        PK: `USER#${userEmail}`,
        SK: `EXAM#${examId}`,
      },
    };

    await dynamoDB.send(new DeleteCommand(params));
    
    console.log(`Exam result deleted successfully for user: ${userEmail}, exam: ${examId}`);
    
    return { 
      userId: userEmail, 
      examId,
      deletedAt: new Date().toISOString() 
    };
  } catch (error) {
    console.error("Error deleting exam result:", error);
    throw error;
  }
};

/**
 * Adds a new exam
 * @async
 * @param {Object} examData - Exam data
 * @param {string} examData.createdBy - User ID of exam creator
 * @returns {Promise<Object>} Created exam object with ID
 * @throws {Error} If creation fails
 */
export const addExam = async (examData) => {
  const examId = Date.now().toString();

  const params = {
    TableName: "Exams",
    Item: {
      PK: "EXAM#ALL",
      SK: `EXAM#${examId}`,
      id: examId,
      ...examData,
      GSI1PK: `USER#${examData.createdBy}`,
      GSI1SK: `EXAM#${examId}`,
    },
  };

  await dynamoDB.send(new PutCommand(params));
  
  // Invalidate cache when a new exam is added
  examsCache.data = null;
  examsCache.timestamp = 0;
  
  return { id: examId };
};

/**
 * Gets all exams
 * @async
 * @returns {Promise<Array>} Array of exam objects
 * @throws {Error} If fetching fails
 */
export const getExams = async () => {
  // Check if we have valid cached data
  const currentTime = Date.now();
  if (examsCache.data && (currentTime - examsCache.timestamp < examsCache.expiryTime)) {
    return examsCache.data;
  }

  const params = {
    TableName: "Exams",
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: {
      ":pk": "EXAM#ALL",
    },
  };

  try {
    const response = await dynamoDB.send(new QueryCommand(params));
    // Cache the results
    examsCache.data = response.Items || [];
    examsCache.timestamp = currentTime;
    return examsCache.data;
  } catch (error) {
    console.error("Error in getExams:", error);
    throw error;
  }
};

/**
 * Gets a specific exam by ID
 * @async
 * @param {string} examId - ID of the exam
 * @returns {Promise<Object>} Exam object
 * @throws {Error} If exam not found or fetch fails
 */
export const getExam = async (examId) => {
  // First check the cache to avoid a database call
  if (examsCache.data) {
    const cachedExam = examsCache.data.find(exam => exam.id === examId);
    if (cachedExam) {
      return cachedExam;
    }
  }

  const params = {
    TableName: "Exams",
    KeyConditionExpression: "PK = :pk AND SK = :sk",
    ExpressionAttributeValues: {
      ":pk": "EXAM#ALL",
      ":sk": `EXAM#${examId}`,
    },
  };

  try {
    const response = await dynamoDB.send(new QueryCommand(params));
    if (!response.Items || response.Items.length === 0) {
      throw new Error("Exam not found");
    }
    return response.Items[0];
  } catch (error) {
    console.error("Error getting exam:", error);
    throw error;
  }
};

/**
 * Deletes an exam
 * @async
 * @param {string} examId - ID of the exam to delete
 * @returns {Promise<Object>} Object containing deleted exam ID
 * @throws {Error} If deletion fails
 */
export const deleteExam = async (examId) => {
  const params = {
    TableName: "Exams",
    Key: {
      PK: "EXAM#ALL",
      SK: `EXAM#${examId}`,
    },
  };

  try {
    await dynamoDB.send(new DeleteCommand(params));
    
    // Invalidate cache when an exam is deleted
    examsCache.data = null;
    examsCache.timestamp = 0;
    
    return { id: examId };
  } catch (error) {
    console.error("Error deleting exam:", error);
    throw error;
  }
};
