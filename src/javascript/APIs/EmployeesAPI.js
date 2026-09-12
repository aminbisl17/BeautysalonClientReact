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
      throw new Error(`Failed to fetch employees. Status: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    ExceptionHandler.handle(err);
    return [];
  }
}