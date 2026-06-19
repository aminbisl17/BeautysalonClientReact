import { ExceptionHandler } from "../Exceptions/ExceptionHandler";

export async function fetchEmployees() {
  try {
    const response = await fetch(
      "http://192.168.100.116:8000/web/employees/all",
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