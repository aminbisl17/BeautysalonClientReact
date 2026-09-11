import { ExceptionHandler } from "../Exceptions/ExceptionHandler";

export async function fetchEmployees() {
  try {
    const response = await fetch(
      "https://beautysalon-amin-2026-ghfzbxbqcvdfb2hf.austriaeast-01.azurewebsites.net/web/employees/all",
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