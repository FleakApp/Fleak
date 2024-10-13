import type { infer as ZodInfer, ZodSchema } from "zod";

interface Json {
  [x: string]: string | number | boolean | Date | Json | JsonArray;
}

type JsonArray = (string | number | boolean | Date | Json | JsonArray)[];

interface TypedSchema extends ZodSchema {
  _type: never;
}

export class net {
  /**
   * Generic fetcher function with error handling and response sanitization.
   * @param method HTTP request method
   * @param path API endpoint or path
   * @param body Optional request body
   * @param schema Optional schema for sanitizing the response
   */
  public static async fetch<T, Schema extends TypedSchema | void = void>(
    method: "GET" | "PUT" | "POST" | "DELETE",
    path: string,
    body?: Schema extends TypedSchema ? ZodInfer<Schema> : never,
    schema?: ZodSchema<T> // Optional schema to validate and sanitize the response
  ): Promise<T> {
    const url = path.startsWith("http") ? path : "/api" + path;

    const response = await fetch(url, {
      method,
      body: body && JSON.stringify(body),
      headers: body ? { "Content-Type": "application/json" } : undefined,
      credentials: "include",
    });

    // Handle response
    const res = await this.processResponse<T>(response, schema);
    return res;
  }

  /**
   * Mock function with enhanced error handling and sanitization.
   * @param key Authorization key
   * @param method HTTP request method
   * @param path API endpoint or path
   * @param body Optional request body
   * @param schema Optional schema for sanitizing the response
   */
  public static async mock<T, Schema extends TypedSchema | void = void>(
    key: string,
    method: "GET" | "PUT" | "POST" | "DELETE",
    path: string,
    body?: Schema extends TypedSchema ? ZodInfer<Schema> : never,
    schema?: ZodSchema<T> // Optional schema to validate and sanitize the response
  ): Promise<T> {
    const url = path.startsWith("http") ? path : "/api" + path;

    const response = await fetch(url, {
      method,
      body: body && JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      credentials: "include",
    });

    // Handle response
    const res = await this.processResponse<T>(response, schema);
    return res;
  }

  /**
   * Process the API response, validate, and sanitize the output.
   * @param response Fetch response object
   * @param schema Optional Zod schema for validating the response data
   */
  private static async processResponse<T>(
    response: Response,
    schema?: ZodSchema<T>
  ): Promise<T> {
    const contentType = response.headers.get("Content-Type");

    if (response.status >= 400) {
      // Parse error message if available
      let errorMessage = "Something went wrong!";
      if (contentType && contentType.includes("application/json")) {
        const errorRes = await response.json();
        errorMessage = errorRes?.message || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // If response is not JSON, throw an error
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Invalid response format");
    }

    // Parse response
    const res = await response.json();

    // Sanitize response using the provided schema
    if (schema) {
      try {
        return schema.parse(res);
      } catch (err) {
        throw new Error("Response validation failed: " + err.message);
      }
    }

    // If no schema is provided, assume the response is safe
    return res as T;
  }
}
