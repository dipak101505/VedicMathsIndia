/**
 * This service is used to get the lecture notes for a specific video
 * It is used to display the lecture notes in the video page
 * It is also used to display the lecture notes in the video page
 * It is also used to display the lecture notes in the video page
 */

import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  DescribeTableCommand,
  CreateTableCommand,
} from "@aws-sdk/client-dynamodb";
import { dynamoDB } from "../firebase/config";

/**
 * Ensures that the DynamoDB table exists before performing operations.
 * @returns {Promise<void>}
 */
export const ensureTableExists = async () => {
  const tableName = "LectureNotes";

  try {
    // Check if the table already exists
    await dynamoDB.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`Table '${tableName}' already exists.`);
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      console.log(`Table '${tableName}' not found. Creating...`);

      // Create the table
      const params = {
        TableName: tableName,
        KeySchema: [
          { AttributeName: "PK", KeyType: "HASH" }, // Partition key
          { AttributeName: "SK", KeyType: "RANGE" }, // Sort key
        ],
        AttributeDefinitions: [
          { AttributeName: "PK", AttributeType: "S" },
          { AttributeName: "SK", AttributeType: "S" },
        ],
        BillingMode: "PAY_PER_REQUEST",
      };

      await dynamoDB.send(new CreateTableCommand(params));
      console.log(`Table '${tableName}' created successfully.`);
    } else {
      console.error(`Error checking table existence: ${error.message}`);
      throw error;
    }
  }
};

/**
 * Adds new lecture notes for a specific video.
 */
export const addLectureNotes = async (videoKey, notesData) => {
  try {
    await ensureTableExists();

    if (!videoKey || !notesData.title || !notesData.content) {
      throw new Error("Missing required fields");
    }

    const timestamp = new Date().toISOString();

    const params = {
      TableName: "LectureNotes",
      Item: {
        PK: `VIDEO#${videoKey}`,
        SK: "NOTES#1",
        title: notesData.title,
        content: notesData.content,
        imageBase64: notesData.imageBase64 || null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };

    await dynamoDB.send(new PutCommand(params));
    return params.Item;
  } catch (error) {
    console.error("Error in addLectureNotes:", error);
    throw new Error(`Failed to add lecture notes: ${error.message}`);
  }
};

/**
 * Retrieves lecture notes for a specific video.
 */
export const getLectureNotes = async (videoKey) => {
  try {
    await ensureTableExists();

    const params = {
      TableName: "LectureNotes",
      Key: {
        PK: `VIDEO#${videoKey}`,
        SK: "NOTES#1",
      },
    };

    const response = await dynamoDB.send(new GetCommand(params));
    return response.Item || null;
  } catch (error) {
    console.error("Error in getLectureNotes:", error);
    throw new Error(`Failed to get lecture notes: ${error.message}`);
  }
};

/**
 * Updates existing lecture notes.
 */
export const updateLectureNotes = async (videoKey, updateData) => {
  try {
    await ensureTableExists();

    let updateExpression = "SET updatedAt = :updatedAt";
    const expressionAttributeValues = {
      ":updatedAt": new Date().toISOString(),
    };

    if (updateData.title) {
      updateExpression += ", title = :title";
      expressionAttributeValues[":title"] = updateData.title;
    }
    if (updateData.content) {
      updateExpression += ", content = :content";
      expressionAttributeValues[":content"] = updateData.content;
    }
    if (updateData.imageBase64) {
      updateExpression += ", imageBase64 = :imageBase64";
      expressionAttributeValues[":imageBase64"] = updateData.imageBase64;
    }

    const params = {
      TableName: "LectureNotes",
      Key: {
        PK: `VIDEO#${videoKey}`,
        SK: "NOTES#1",
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    const response = await dynamoDB.send(new UpdateCommand(params));
    return response.Attributes;
  } catch (error) {
    console.error("Error in updateLectureNotes:", error);
    throw new Error(`Failed to update lecture notes: ${error.message}`);
  }
};

/**
 * Deletes lecture notes for a specific video.
 */
export const deleteLectureNotes = async (videoKey) => {
  try {
    await ensureTableExists();

    const params = {
      TableName: "LectureNotes",
      Key: {
        PK: `VIDEO#${videoKey}`,
        SK: "NOTES#1",
      },
    };

    await dynamoDB.send(new DeleteCommand(params));
  } catch (error) {
    console.error("Error in deleteLectureNotes:", error);
    throw new Error(`Failed to delete lecture notes: ${error.message}`);
  }
};

/**
 * Validates lecture notes data.
 */
export const validateNotesData = (data) => {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = "Title is required";
  }

  if (!data.content?.trim()) {
    errors.content = "Content is required";
  }

  if (data.imageBase64 && !data.imageBase64.startsWith("data:image/")) {
    errors.image = "Invalid image format";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
