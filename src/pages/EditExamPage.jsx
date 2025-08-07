// src/pages/EditExamPage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  getExamQuestions,
  saveQuestion,
  deleteQuestion,
  getExamQuestionsByTopicAndDifficulty,
  saveExamQuestion,
  getTopics,
} from "../services/questionService";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Katex from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "react-tooltip";

const CONTENT_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  LATEX: "latex",
  TABLE: "table",
};

const QUESTION_TYPES = {
  MCQ: "single",
  MULTIPLE: "multiple",
  INTEGER: "integer",
  NUMERICAL: "numerical",
};

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const EditorSection = styled.div`
  width: 40%;
  padding: 20px;
  border-right: 1px solid #e2e8f0;
  overflow-y: auto;
`;

const PreviewSection = styled.div`
  width: 50%;
  padding: 20px;
  overflow-y: auto;

  .solution-preview {
    margin-top: 2px;
    padding: 5px;
    border-top: 2px solid #e2e8f0;
  }
`;

const defaultQuestionSchema = {
  contents: [],
  type: QUESTION_TYPES.MCQ,
  options: [],
  correctAnswer: "",
  solutionContent: [],
  metadata: {
    section: "",
    topic: "",
    difficulty: "medium",
    marks: { correct: 4, incorrect: -1 },
  },
};

const LatexRenderer = ({ content }) => {
  // Split content by LaTeX delimiters
  const parts = content.split(/(\$[^\$]+\$|\\\\)/g);

  return (
    <div className="latex-content">
      {parts.map((part, index) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          // Inline math
          return (
            <Katex
              key={index}
              math={part.slice(1, -1)}
              settings={{ throwOnError: false }}
            />
          );
        } else if (part === "\\\\") {
          // Line break
          return <br key={index} />;
        } else {
          // Regular text with possible LaTeX commands
          return <span key={index}>{part}</span>;
        }
      })}
    </div>
  );
};

const ContentRenderer = ({ content }) => {
  switch (content.type) {
    case CONTENT_TYPES.TEXT:
      return <span className="text-content">{content.value}</span>;
    case CONTENT_TYPES.LATEX:
      return <LatexRenderer content={content.value} />;
    case CONTENT_TYPES.IMAGE:
      return (
        <div>
          <img
            src={content.value}
            width={content.dimensions?.width}
            height={content.dimensions?.height}
            alt="Question content"
            className="my-2"
            style={{ marginTop: "10px", marginBottom: "10px" }}
          />
        </div>
      );
    default:
      return null;
  }
};

const EditExamPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [examContent, setExamContent] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(defaultQuestionSchema);
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [fileredQuestions, setFilteredQuestions] = useState([]);
  
  // Get examData from URL parameters or location state
  const [examData, setExamData] = useState(null);
  useEffect(() => {
    // Check if data is in URL parameters
    const params = new URLSearchParams(window.location.search);
    const examDataParam = params.get('examData');
    
    if (examDataParam) {
      try {
        // Parse the JSON data from URL
        const parsedData = JSON.parse(decodeURIComponent(examDataParam));
        setExamData(parsedData);
      } catch (error) {
        console.error("Error parsing exam data from URL:", error);
        // Fallback to location state if available
        if (location.state?.examData) {
          setExamData(location.state.examData);
        }
      }
    } else if (location.state?.examData) {
      // Fallback to location state
      setExamData(location.state.examData);
    }
  }, [location]);

  const [topics, setTopics] = useState([]);
  const [expandedSolutionId, setExpandedSolutionId] = useState(null);
  const [includeAnswers, setIncludeAnswers] = useState(false);

  const fetchTopics = useCallback(async () => {
    try {
      const topicsList = await getTopics();
      setTopics(topicsList.map((topic) => topic.topicName));
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  }, []);

  useEffect(() => {
    if (topics?.length === 0) {
      fetchTopics();
    }
  }, []);

  // Topic selection handler
  const handleTopicSelect = (topic) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        topic: topic,
      },
    }));
    setSelectedTopic(topic);
  };

  // Fetch questions from DynamoDB when examData is loaded
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (examData?.id) {
          const fetched = await getExamQuestions(examData.id);
          setQuestions(fetched?.questions);
          setExamContent(fetched?.contents);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };
    fetchQuestions();
  }, [examData?.id]);

  // Filter questions by topic and difficulty
  useEffect(() => {
    const fetchFilteredQuestions = async () => {
      try {
        if (selectedTopic && selectedDifficulty) {
          const fetched = await getExamQuestionsByTopicAndDifficulty(
            selectedTopic,
            selectedDifficulty,
          );
          setFilteredQuestions(fetched);
        }
      } catch (error) {
        console.error("Error fetching filtered questions:", error);
      }
    };
    fetchFilteredQuestions();
  }, [selectedTopic, selectedDifficulty]);

  // ...existing code...
  const handleAddContent = (type) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      contents: [
        ...(Array.isArray(prev.contents) ? prev.contents : []),
        {
          type,
          value: "",
          dimensions:
            type === CONTENT_TYPES.IMAGE ? { width: 400, height: 300 } : 0,
        },
      ],
    }));
  };
  // ...existing code...

  const handleContentChange = (index, value, dimensions) => {
    setCurrentQuestion((prev) => {
      const newContents = [
        ...(Array.isArray(prev.contents) ? prev.contents : []),
      ];
      if (dimensions) {
        newContents[index] = { ...newContents[index], value, dimensions };
      } else {
        newContents[index] = { ...newContents[index], value };
      }
      return { ...prev, contents: newContents };
    });
  };

  const handleImageUpload = async (file, index) => {
    try {
      // Create storage reference
      const storageRef = ref(
        storage,
        `exam-questions/${file.name}_${Date.now()}`,
      );

      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Monitor upload
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload progress:", progress);
        },
        (error) => {
          console.error("Error uploading image:", error);
        },
        async () => {
          // Get download URL
          const downloadURL = await getDownloadURL(storageRef);

          // Update question content with URL
          handleContentChange(index, downloadURL);
        },
      );
    } catch (error) {
      console.error("Error handling image upload:", error);
    }
  };

  const processQuestionInput = (input) => {
    // 1. Split the input into question blocks.
    const questionBlocks = input.trim().split(/\s*Q\.\s*\d+\s*/);
    const allQuestionsParts = [];

    // 2. Process each block.
    for (const block of questionBlocks) {
      if (block.trim().length === 0) {
        continue;
      }

      // 3. Normalize line endings and process one question.
      const text = block.replace(/\r\n/g, "\n").trim();
      const parts = text.split(/\n\s*(?=Answer:|Solution:)/);

      let questionAndOptions = parts[0] || "";
      let answer = "";
      let solution = "";

      for (let i = 1; i < parts.length; i++) {
        if (parts[i].startsWith("Answer:")) {
          answer = parts[i];
        } else if (parts[i].startsWith("Solution:")) {
          solution = parts[i];
        }
      }

      // 4. Extract question and options.
      const lines = questionAndOptions.trim().split('\n');
      let question = "";
      const options = [];
      let currentlyParsing = "question";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (/^[A-D]\)/.test(trimmedLine)) {
          currentlyParsing = "options";
          options.push(trimmedLine);
        } else {
          if (currentlyParsing === "question") {
            question += (question ? " " : "") + trimmedLine;
          } else if (options.length > 0) {
            options[options.length - 1] += " " + trimmedLine;
          }
        }
      }

      // 5. Assemble and add parts to the main list.
      const result = [question, ...options];
      if (answer) result.push(answer);
      if (solution) result.push(solution);
      
      const filteredResult = result.filter(part => part && part.trim().length > 0);
      if (filteredResult.length > 0) {
        allQuestionsParts.push(...filteredResult);
      }
    }

    return allQuestionsParts;
  };

  const handleAddOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [
        ...(Array.isArray(prev.options) ? prev.options : []),
        { contents: [] },
      ],
    }));
  };

  const handleOptionContentChange = (optionIndex, contentIndex, value) => {
    setCurrentQuestion((prev) => {
      const newOptions = [...prev.options];
      const option = newOptions[optionIndex];
      const newContents = [...option.contents];
      newContents[contentIndex] = { ...newContents[contentIndex], value };
      newOptions[optionIndex] = { ...option, contents: newContents };
      return { ...prev, options: newOptions };
    });
  };

  const createQuestion = async (ans) => {
    if (!includeAnswers) {
      // Original behavior without answers/solutions
      if (ans.length === 0 || (ans.length % 5) !== 0) {
        toast.error("Improper question format. Each question must have 5 parts (question + 4 options).", {
          position: "top-center",
          duration: 4000,
        });
        return;
      }

      if(currentQuestion?.metadata?.sectionName === undefined || selectedTopic === "") {
        toast.error("Please select section and topic, then repaste", {
          position: "top-center",
        });
        return;
      }

      // Process questions with a delay between saves to avoid DynamoDB throughput limits
      toast.success("Adding questions with a delay to avoid throughput limits. Please wait...", {
        position: "top-center",
        duration: 4000,
      });
      
      for (let i = 0; i < ans.length; i += 5) {
        const questionId = Date.now().toString() + i;
        const questionObject = {
          id: questionId,
          type: "single",
          contents: [
            {
              type: "latex",
              value: ans[i],
              dimensions: 0,
            },
          ],
          options: [
            {
              contents: [{ type: "latex", value: ans[i + 1] }],
            },
            {
              contents: [{ type: "latex", value: ans[i + 2] }],
            },
            {
              contents: [{ type: "latex", value: ans[i + 3] }],
            },
            {
              contents: [{ type: "latex", value: ans[i + 4] }],
            },
          ],
          correctAnswer: "b",
          metadata: {
            difficulty: selectedDifficulty,
            marks: {
              correct: 4,
              incorrect: -1,
            },
            section: currentQuestion?.metadata?.section,
            topic: selectedTopic,
            sectionName: currentQuestion?.metadata?.sectionName,
          },
          solutionContent: [{ type: "latex", value: "  " }],
        };
        
        try {
          await saveQuestion(examData.id, questionObject);
          setQuestions((prev) => [
            ...prev.filter((q) => q.id !== questionId),
            questionObject,
          ]);
          
          // Add a 500ms delay between question saves to avoid hitting DynamoDB throughput limits
          if (i + 5 < ans.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error("Error saving question:", error);
          toast.error(`Failed to save question ${i/5 + 1}. Retrying in 1 second...`, {
            position: "top-center",
          });
          // Wait a bit longer if we hit an error
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Try one more time
          try {
            await saveQuestion(examData.id, questionObject);
            setQuestions((prev) => [
              ...prev.filter((q) => q.id !== questionId),
              questionObject,
            ]);
          } catch (retryError) {
            console.error("Error on retry:", retryError);
            toast.error(`Failed to save question ${i/5 + 1} after retry. Continuing with next question.`, {
              position: "top-center",
            });
          }
        }
      }
    } else {
      // New behavior with answers and solutions (7 parts per question)
      if (ans.length === 0 || (ans.length % 7) !== 0) {
        toast.error("Improper question format. Each question must have 7 parts (question + 4 options + answer + solution).", {
          position: "top-center",
          duration: 4000,
        });
        return;
      }

      if(currentQuestion?.metadata?.sectionName === undefined || selectedTopic === "") {
        toast.error("Please select section and topic, then repaste", {
          position: "top-center",
        });
        return;
      }

      // Process questions with a delay between saves to avoid DynamoDB throughput limits
      toast.success("Adding questions with a delay to avoid throughput limits. Please wait...", {
        position: "top-center",
        duration: 4000,
      });
      
      for (let i = 0; i < ans.length; i += 7) {
        // Extract the correct answer (expecting format like "Answer: B")
        const answerText = ans[i + 5];
        const answerMatch = answerText.match(/Answer:\s*([A-D])/i);
        let correctAnswer = "b"; // Default
        
        if (answerMatch && answerMatch[1]) {
          // Convert letter to lowercase index (A->a, B->b, etc.)
          correctAnswer = answerMatch[1].toLowerCase();
        }
        
        const questionId = Date.now().toString() + i;
        const questionObject = {
          id: questionId,
          type: "single",
          contents: [
            {
              type: "latex",
              value: ans[i],
              dimensions: 0,
            },
          ],
          options: [
            {
              contents: [{ type: "latex", value: ans[i + 1].replace(/^A\)\s*/, "") }],
            },
            {
              contents: [{ type: "latex", value: ans[i + 2].replace(/^B\)\s*/, "") }],
            },
            {
              contents: [{ type: "latex", value: ans[i + 3].replace(/^C\)\s*/, "") }],
            },
            {
              contents: [{ type: "latex", value: ans[i + 4].replace(/^D\)\s*/, "") }],
            },
          ],
          correctAnswer: correctAnswer,
          metadata: {
            difficulty: selectedDifficulty,
            marks: {
              correct: 4,
              incorrect: -1,
            },
            section: currentQuestion?.metadata?.section,
            topic: selectedTopic,
            sectionName: currentQuestion?.metadata?.sectionName,
          },
          solutionContent: [{ 
            type: "latex", 
            value: ans[i + 6].replace(/Solution:\s*/i, "") // Remove the "Solution:" prefix
          }],
        };
        
        try {
          await saveQuestion(examData.id, questionObject);
          setQuestions((prev) => [
            ...prev.filter((q) => q.id !== questionId),
            questionObject,
          ]);
          
          // Add a 500ms delay between question saves to avoid hitting DynamoDB throughput limits
          if (i + 7 < ans.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error("Error saving question:", error);
          toast.error(`Failed to save question ${i/7 + 1}. Retrying in 1 second...`, {
            position: "top-center",
          });
          // Wait a bit longer if we hit an error
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Try one more time
          try {
            await saveQuestion(examData.id, questionObject);
            setQuestions((prev) => [
              ...prev.filter((q) => q.id !== questionId),
              questionObject,
            ]);
          } catch (retryError) {
            console.error("Error on retry:", retryError);
            toast.error(`Failed to save question ${i/7 + 1} after retry. Continuing with next question.`, {
              position: "top-center",
            });
          }
        }
      }
    }
    
    toast.success("Questions added successfully", {
      position: "top-center",
      duration: 4000,
    });
  };

  // Example: Save or update question
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate an ID if needed
      const questionId = currentQuestion.id || Date.now().toString();
      const questionWithId = {
        ...currentQuestion,
        id: questionId,
      };

      // Save to DynamoDB
      console.log("Saving question:", questionWithId);
      await saveQuestion(examData.id, questionWithId);

      // Update local state
      setQuestions((prev) => [
        ...prev.filter((q) => q.id !== questionId),
        questionWithId,
      ]);

      // Reset form
      setCurrentQuestion(defaultQuestionSchema);
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  // Example: Delete question
  const handleDeleteQuestion = async (questionId) => {
    try {
      await deleteQuestion(examData.id, questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  // Get unique sections from questions
  const uniqueSections = [
    ...new Set(questions?.map((q) => q?.metadata?.section)),
  ].filter(Boolean);

  const TopicAutocomplete = ({ onSelect, initialValue }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialValue || "");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    const filteredTopics = topics.filter((topic) =>
      topic.toLowerCase().includes(inputValue.toLowerCase()),
    );

    // Add click outside handler
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          inputRef.current &&
          !inputRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (topic) => {
      setInputValue(topic);
      setIsOpen(false);
      onSelect(topic);
    };

    return (
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={(e) => {
            // Don't close if clicking on dropdown
            if (!dropdownRef.current?.contains(e.relatedTarget)) {
              setTimeout(() => setIsOpen(false), 200);
            }
          }}
          placeholder="Search or select topic..."
          style={{
            width: "40%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        {isOpen && (
          <ul
            ref={dropdownRef}
            style={{
              position: "absolute",
              width: "100%",
              maxHeight: "200px",
              overflowY: "auto",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderTop: "none",
              borderRadius: "0 0 4px 4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              zIndex: 1000,
              margin: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            {filteredTopics.map((topic, index) => (
              <li
                key={topic}
                onClick={() => handleSelect(topic)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  backgroundColor:
                    index === highlightedIndex ? "#f0f0f0" : "white",
                }}
              >
                {topic}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const toggleSolution = (questionId) => {
    console.log("Toggling solution for question:", questionId);
    setExpandedSolutionId(
      expandedSolutionId === questionId ? null : questionId,
    );
  };

  return (
    <Container>
      <EditorSection>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="metadata-section">
            <h3>Metadata</h3>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={currentQuestion.metadata.section}
                onChange={(e) =>
                  {
                    setCurrentQuestion({
                    ...currentQuestion,
                    metadata: {
                      ...currentQuestion.metadata,
                      section: e.target.value,
                      sectionName: examData?.subject.find(
                        (s) => s.id === e.target.value,
                      )?.name,
                    },
                  })
                }
                }
                className="p-2 border rounded"
              >
                <option value="">Select Section</option>
                {examData?.sections.map((section, index) => (
                  <option key={index} value={section}>
                    {examData?.subject.find((s) => s.id === section)?.name}
                  </option>
                ))}
              </select>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  Topic *
                  <TopicAutocomplete
                    onSelect={handleTopicSelect}
                    initialValue={currentQuestion?.metadata?.topic || ""}
                  />
                </label>
              </div>

              <input
                type="text"
                value={currentQuestion.metadata.topic}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    metadata: {
                      ...currentQuestion.metadata,
                      topic: e.target.value,
                    },
                  })
                }
                placeholder="Topic"
                className="p-2 border rounded"
                style={{ marginLeft: "10px" }}
              />

              {/* Question Type */}

              <select
                value={currentQuestion.type}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    type: e.target.value,
                  })
                }
                className="p-2 border rounded"
                style={{ marginLeft: "10px" }}
              >
                <option value="">Select Question Type</option>
                <option value={QUESTION_TYPES.MCQ}>
                  Multiple Choice (Single)
                </option>
                <option value={QUESTION_TYPES.MULTIPLE}>
                  Multiple Choice (Multiple)
                </option>
                <option value={QUESTION_TYPES.INTEGER}>Integer Type</option>
                {/* <option value={QUESTION_TYPES.NUMERICAL}>Numerical Type</option> */}
              </select>

              {/* Difficulty */}
              <select
                value={currentQuestion.metadata.difficulty}
                onChange={(e) => {
                  setCurrentQuestion({
                    ...currentQuestion,
                    metadata: {
                      ...currentQuestion.metadata,
                      difficulty: e.target.value,
                    },
                  });
                  setSelectedDifficulty(e.target.value);
                }}
                className="p-2 border rounded"
                style={{ marginLeft: "10px" }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* Marks */}
              <div>
                <input
                  type="number"
                  value={currentQuestion.metadata.marks?.correct}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      metadata: {
                        ...currentQuestion.metadata,
                        marks: {
                          ...currentQuestion.metadata.marks,
                          correct: Number(e.target.value),
                        },
                      },
                    })
                  }
                  placeholder="Correct Marks"
                  className="p-2 border rounded w-full"
                />
                <input
                  type="number"
                  value={currentQuestion.metadata.marks?.incorrect}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      metadata: {
                        ...currentQuestion.metadata,
                        marks: {
                          ...currentQuestion.metadata.marks,
                          incorrect: Number(e.target.value),
                        },
                      },
                    })
                  }
                  placeholder="Negative Marks"
                  className="p-2 border rounded w-full"
                  style={{ marginTop: "10px", marginLeft: "10px" }}
                />
              </div>

              {/* Correct Answer */}
              Answer:
              <input
                type="text"
                value={currentQuestion?.correctAnswer}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    correctAnswer: e.target.value,
                  })
                }
                placeholder="Correct Answer"
                className="p-2 border rounded"
                style={{ marginTop: "10px" }}
              />
              <button
                type="submit"
                className="w-full py-2 bg-blue-500 text-white rounded"
                style={{
                  cursor: "pointer",
                  marginBottom: "10px",
                  maxWidth: "120px",
                  textAlign: "center",
                  marginTop: "10px",
                  backgroundColor: "#ffa600",
                  marginLeft: "10px",
                  
                }}
              >
                Add Question
              </button>
              <div className="solution-section mt-6 border-t pt-4">
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>
              Solution
            </span>

            <div
              className={`
              content-controls mt-2
            `}
            >
              <div className="flex gap-2">
                {Object.entries(CONTENT_TYPES)?.map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setCurrentQuestion({
                        ...currentQuestion,
                        solutionContent: [
                          ...(currentQuestion.solutionContent || []),
                          {
                            type: value,
                            value: "",
                            dimensions:
                              value === CONTENT_TYPES.IMAGE
                                ? { width: 300, height: 200 }
                                : undefined,
                          },
                        ],
                      });
                    }}
                    className="px-2 py-1 border rounded text-sm"
                    style={{
                      width: "20%",
                      textAlign: "center",
                      cursor: "pointer",
                      marginRight: "10px",
                      marginBottom: "10px",
                      backgroundColor: "#ffa600",
                    }}
                  >
                    Add {key}
                  </button>
                ))}
              </div>

              {currentQuestion.solutionContent?.map((content, index) => (
                <div key={index} className="mt-2">
                  {content.type === CONTENT_TYPES.IMAGE ? (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // Upload and handle solution image
                            const handleSolutionImageUpload = async (file) => {
                              try {
                                const storageRef = ref(
                                  storage,
                                  `exam-solutions/${file.name}_${Date.now()}`,
                                );
                                const uploadTask = uploadBytesResumable(
                                  storageRef,
                                  file,
                                );

                                uploadTask.on(
                                  "state_changed",
                                  (snapshot) => {
                                    const progress =
                                      (snapshot.bytesTransferred /
                                        snapshot.totalBytes) *
                                      100;
                                    console.log(
                                      "Solution upload progress:",
                                      progress,
                                    );
                                  },
                                  (error) => {
                                    console.error(
                                      "Error uploading solution image:",
                                      error,
                                    );
                                  },
                                  async () => {
                                    const downloadURL =
                                      await getDownloadURL(storageRef);
                                    const newContents = [
                                      ...currentQuestion.solutionContent,
                                    ];
                                    newContents[index] = {
                                      ...content,
                                      value: downloadURL,
                                    };
                                    setCurrentQuestion({
                                      ...currentQuestion,
                                      solutionContent: newContents,
                                    });
                                  },
                                );
                              } catch (error) {
                                console.error(
                                  "Error handling solution image upload:",
                                  error,
                                );
                              }
                            };
                            handleSolutionImageUpload(file);
                          }
                        }}
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="text"
                        value={content.value}
                        onChange={(e) => {
                          const newContents = [
                            ...currentQuestion.solutionContent,
                          ];
                          newContents[index] = {
                            ...content,
                            value: e.target.value,
                          };
                          setCurrentQuestion({
                            ...currentQuestion,
                            solutionContent: newContents,
                          });
                        }}
                        placeholder="Image URL"
                        className="w-full p-2 border rounded"
                      />
                      <div className="flex gap-2 mt-1">
                        <input
                          type="number"
                          value={content.dimensions?.width || ""}
                          onChange={(e) => {
                            const newContents = [
                              ...currentQuestion.solutionContent,
                            ];
                            newContents[index] = {
                              ...content,
                              dimensions: {
                                ...content.dimensions,
                                width: Number(e.target.value),
                              },
                            };
                            setCurrentQuestion({
                              ...currentQuestion,
                              solutionContent: newContents,
                            });
                          }}
                          placeholder="Width"
                          className="w-24 p-2 border rounded"
                        />
                        <input
                          type="number"
                          value={content.dimensions?.height || ""}
                          onChange={(e) => {
                            const newContents = [
                              ...currentQuestion.solutionContent,
                            ];
                            newContents[index] = {
                              ...content,
                              dimensions: {
                                ...content.dimensions,
                                height: Number(e.target.value),
                              },
                            };
                            setCurrentQuestion({
                              ...currentQuestion,
                              solutionContent: newContents,
                            });
                          }}
                          placeholder="Height"
                          className="w-24 p-2 border rounded"
                        />
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={content.value}
                      onChange={(e) => {
                        const newContents = [
                          ...currentQuestion.solutionContent,
                        ];
                        newContents[index] = {
                          ...content,
                          value: e.target.value,
                        };
                        setCurrentQuestion({
                          ...currentQuestion,
                          solutionContent: newContents,
                        });
                      }}
                      className="w-full p-2 border rounded"
                      rows="3"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
            </div>
          </div>
          
          <div className="content-controls">
            <span><b>Add Bulk questions</b></span>
            <span
              id="bulk-questions-tooltip"
              style={{ marginLeft: "8px", cursor: "pointer" }}
            >
              <FontAwesomeIcon icon={faInfoCircle} style={{ color: "#007bff" }} />
            </span>
            <Tooltip
              anchorId="bulk-questions-tooltip"
              content={
              <>
                You can paste multiple questions in bulk format here. <br />
                Each question should follow the required structure. <br />
                <br />
                <b>Format:</b> <br />
                Q. 1 This is the first question \\<br />
                A) Option one \\<br />
                B) Option two \\<br />
                C) Option three \\<br />
                D) Option four \\
                {includeAnswers && (
                  <>
                    <br />Answer: B \\<br />
                    Solution: Explanation for the answer \\
                  </>
                )}
              </>
              }
              place="top"
              style={{ backgroundColor: "#333", color: "#fff", borderRadius: "5px" }}
            />
            
            <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                id="includeAnswers"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              <label htmlFor="includeAnswers" style={{ cursor: "pointer", fontSize: "14px" }}>
                Include answers and solutions in bulk input
              </label>
            </div>
            
              <textarea
              onChange={(e) => {
                const ans = processQuestionInput(e.target.value);
                console.log("Processed parts:", ans);
                createQuestion(ans);
              }}
              placeholder={includeAnswers ? 
                "Q.1 Question text\\\nA) Option A\\\nB) Option B\\\nC) Option C\\\nD) Option D\\\nAnswer: B\\\nSolution: Explanation text\\\n" : 
                "Q.1 Question text\\\nA) Option A\\\nB) Option B\\\nC) Option C\\\nD) Option D\\\n"
              }
              className="p-2 border rounded w-full"
              rows="6"
              style={{ marginTop: "10px", resize: "vertical", width: "80%", maxWidth: "800px" }}
            ></textarea>
            <div><b>Sample Paper</b></div>
            <textarea
              onChange={(e) => {
                setExamContent(e.target.value); // Update the content state
              }}
              value={examContent}
              className="p-2 border rounded w-full"
              rows="2"
              style={{ marginTop: "10px", resize: "vertical", width: "80%", maxWidth: "800px" }}
            ></textarea>
            <h3>Edit Question Content</h3>
            <div className="flex gap-2">
              {Object.entries(CONTENT_TYPES)?.map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleAddContent(value)}
                  className="flex-1 px-3 py-1 border rounded bg-orange-500 text-white hover:bg-orange-600"
                  style={{
                    width: "20%",
                    textAlign: "center",
                    cursor: "pointer",
                    marginRight: "10px",
                    marginBottom: "10px",
                    backgroundColor: "#ffa600",
                  }}
                >
                  Add {key}
                </button>
              ))}
            </div>

            {currentQuestion.contents?.map((content, index) => (
              <div key={index} className="mt-2">
                {content.type === CONTENT_TYPES.IMAGE ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleImageUpload(file, index);
                        }
                      }}
                      className="w-full p-2 border rounded"
                    />

                    <input
                      type="text"
                      value={content.value}
                      onChange={(e) =>
                        handleContentChange(index, e.target.value)
                      }
                      placeholder="Image URL"
                      className="w-full p-2 border rounded"
                    />
                    <div className="flex gap-2 mt-1">
                      <input
                        type="number"
                        value={content.dimensions.width}
                        onChange={(e) =>
                          handleContentChange(index, content.value, {
                            ...content.dimensions,
                            width: Number(e.target.value),
                          })
                        }
                        placeholder="Width"
                        className="w-24 p-2 border rounded"
                      />
                      <input
                        type="number"
                        value={content.dimensions.height}
                        onChange={(e) =>
                          handleContentChange(index, content.value, {
                            ...content.dimensions,
                            height: Number(e.target.value),
                          })
                        }
                        placeholder="Height"
                        className="w-24 p-2 border rounded"
                      />
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={content.value}
                    onChange={(e) => handleContentChange(index, e.target.value)}
                    className="w-full p-2 border rounded"
                    rows="3"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="options-section">
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>
              Options
            </span>
            <button
              type="button"
              onClick={handleAddOption}
              className="px-3 py-1 border rounded"
              style={{
                cursor: "pointer",
                width: "20%",
                backgroundColor: "#ffa600",
                marginBottom: "2vh",
                marginLeft: "1vw",
                marginTop: "2vh",
              }}
            >
              Add Option
            </button>

            {currentQuestion.options?.map((option, optIndex) => (
              <div
                key={optIndex}
                className="mt-2 p-2 border rounded"
                style={{ marginBottom: "1vh" }}
              >
                <div className="flex gap-2">
                  {/* <span>{String.fromCharCode(65 + optIndex)}.</span>   */}
                  {Object.entries(CONTENT_TYPES)?.map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        const newOptions = [...currentQuestion.options];
                        newOptions[optIndex].contents.push({
                          type: value,
                          value: "",
                          dimensions: value === CONTENT_TYPES.IMAGE ? { width: 400, height: 300 } : undefined
                        });
                        setCurrentQuestion({
                          ...currentQuestion,
                          options: newOptions,
                        });
                      }}
                      className="px-2 py-1 border rounded text-sm"
                      style={{
                        width: "20%",
                        textAlign: "center",
                        cursor: "pointer",
                        marginRight: "10px",
                        marginBottom: "10px",
                        backgroundColor: "#ffa600",
                      }}
                    >
                      Add {key}
                    </button>
                  ))}
                </div>

                {option.contents?.map((content, contentIndex) => (
                  <div key={contentIndex} className="mt-2">
                    {content.type === CONTENT_TYPES.IMAGE ? (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              // Upload and handle option image
                              const handleOptionImageUpload = async (file) => {
                                try {
                                  const storageRef = ref(
                                    storage,
                                    `exam-options/${file.name}_${Date.now()}`
                                  );
                                  const uploadTask = uploadBytesResumable(storageRef, file);

                                  uploadTask.on(
                                    "state_changed",
                                    (snapshot) => {
                                      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                      console.log("Option upload progress:", progress);
                                    },
                                    (error) => {
                                      console.error("Error uploading option image:", error);
                                    },
                                    async () => {
                                      const downloadURL = await getDownloadURL(storageRef);
                                      const newOptions = [...currentQuestion.options];
                                      newOptions[optIndex].contents[contentIndex] = {
                                        ...content,
                                        value: downloadURL,
                                      };
                                      setCurrentQuestion({
                                        ...currentQuestion,
                                        options: newOptions,
                                      });
                                    }
                                  );
                                } catch (error) {
                                  console.error("Error handling option image upload:", error);
                                }
                              };
                              handleOptionImageUpload(file);
                            }
                          }}
                          className="w-full p-2 border rounded"
                        />
                        <input
                          type="text"
                          value={content.value}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[optIndex].contents[contentIndex] = {
                              ...content,
                              value: e.target.value,
                            };
                            setCurrentQuestion({
                              ...currentQuestion,
                              options: newOptions,
                            });
                          }}
                          placeholder="Image URL"
                          className="w-full p-2 border rounded"
                        />
                        <div className="flex gap-2 mt-1">
                          <input
                            type="number"
                            value={content.dimensions?.width || ""}
                            onChange={(e) => {
                              const newOptions = [...currentQuestion.options];
                              newOptions[optIndex].contents[contentIndex] = {
                                ...content,
                                dimensions: {
                                  ...content.dimensions,
                                  width: Number(e.target.value),
                                },
                              };
                              setCurrentQuestion({
                                ...currentQuestion,
                                options: newOptions,
                              });
                            }}
                            placeholder="Width"
                            className="w-24 p-2 border rounded"
                          />
                          <input
                            type="number"
                            value={content.dimensions?.height || ""}
                            onChange={(e) => {
                              const newOptions = [...currentQuestion.options];
                              newOptions[optIndex].contents[contentIndex] = {
                                ...content,
                                dimensions: {
                                  ...content.dimensions,
                                  height: Number(e.target.value),
                                },
                              };
                              setCurrentQuestion({
                                ...currentQuestion,
                                options: newOptions,
                              });
                            }}
                            placeholder="Height"
                            className="w-24 p-2 border rounded"
                          />
                        </div>
                      </div>
                    ) : (
                      <textarea
                        value={content.value}
                        onChange={(e) =>
                          handleOptionContentChange(
                            optIndex,
                            contentIndex,
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded"
                        rows="2"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded"
            style={{
              cursor: "pointer",
              marginBottom: "10px",
              width: "80%",
              textAlign: "center",
              marginTop: "10px",
              backgroundColor: "#ffa600",
            }}
          >
            Add Question
          </button>
        </form>
    
        
      </EditorSection>

      <PreviewSection>
        <h2>Preview</h2>

        {/* Section Filter Dropdown */}
        <div className="mb-4">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="all">All Sections</option>
            {uniqueSections.map((section, index) => (
              <option key={index} value={section}>
                {examData?.subject.find((s) => s.id === section)?.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtered Questions */}
        {questions
          ?.filter(
            (question) =>
              selectedSection === "all" ||
              question.metadata?.section === selectedSection,
          )
          .map((question, index) => (
            <div
              key={index}
              className="question-preview mb-4 p-4 border rounded"
            >
              {/* Question content */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => {
                    setQuestions((prevQuestions) =>
                      prevQuestions.filter((q) => q.id !== question.id),
                    );
                    saveExamQuestion(examData.id, question.id, "rm");
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span
                  onClick={() => handleDeleteQuestion(question.id)}
                  style={{
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginTop: "20vh",
                  }}
                >
                  Question {index + 1}
                </span>
              </div>
              <div
                className="contents mb-4"
                onClick={() => setCurrentQuestion(question)}
              >
                {" "}
                {question?.contents?.map((content, i) => (
                  <ContentRenderer key={i} content={content} />
                ))}
              </div>

              {/* Options */}
              <div className="options-list mb-4">
                {question?.options?.map((option, optIndex) => (
                  <div className="flex items-start gap-2">
                    {/* <span className="option-label mt-1">
                    {String.fromCharCode(65 + optIndex)}.
                  </span> */}
                    <div className="option-content flex-1">
                      {option.contents?.map((content, i) => (
                        <ContentRenderer
                          key={i}
                          content={content}
                          className="inline-block"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Solution Toggle */}
              {question?.solutionContent?.length > 0 && (
                <div className="solution-container border-t mt-4">
                  <div
                    onClick={() => toggleSolution(question.id)}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <span className="text-sm font-semibold">
                      Solution {expandedSolutionId === question.id ? "▼" : "▶"}
                    </span>
                  </div>

                  <div
                    className={`
                    solution-content
                    transition-all duration-300 ease-in-out
                    ${
                      expandedSolutionId === question.id
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }
                  `}
                  >
                    <div className="p-3 bg-gray-50 rounded mt-2">
                      {expandedSolutionId === question.id &&
                        question.solutionContent?.map((content, i) => (
                          <ContentRenderer key={i} content={content} />
                        ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="metadata mt-2 text-sm text-gray-600">
                Topic: {question?.metadata?.topic} | Marks:{" "}
                {question?.metadata?.marks?.correct} | Negative Marks:{" "}
                {question?.metadata?.marks?.incorrect} | Correct Answer:{" "}
                {question?.correctAnswer}
              </div>
            </div>
          ))}
      </PreviewSection>
    </Container>
  );
};

export default EditExamPage;
