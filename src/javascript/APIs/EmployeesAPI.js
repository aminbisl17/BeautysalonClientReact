import { ExceptionHandler } from "../Exceptions/ExceptionHandler";

export async function fetchEmployees() {
  try {
    const response = await fetch(
      process.env.REACT_APP_EMPLOYEES_GET_ALL,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch employees. Status: ${response.status}`
      );
    }

    // A 204 response contains no body.
    if (response.status === 204) {
      console.warn("Employees endpoint returned 204 No Content.");
      return [];
    }

    return await response.json();
  } catch (err) {
    ExceptionHandler.handle(err);
    return [];
  }
}