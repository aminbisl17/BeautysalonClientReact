import { ExceptionHandler } from "../Exceptions/ExceptionHandler";
import { TokenException } from "../Exceptions/TokenException";

export async function fetchServices() {
  try {
    const response = await fetch(
      process.env.REACT_APP_SERVICES_GET_ALL,
      {
        method: "GET"
      }
    );

    if (response.status === 401 || response.status === 403) {
      throw new TokenException();
    }

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();

    return data;

  } catch (err) {
    return [];
  }
}


export async function fetchServiceAtributes(ID) {
  const token = sessionStorage.getItem("accessToken");

  try {
    const response = await fetch(
      `${process.env.REACT_APP_SERVICE_GET_ATTRIBUTES}/${ID}`,
      {
        method: "GET",
      }
    );

    if (response.status === 401) throw new TokenException();

    if (!response.ok) {
      throw new Error(`Failed to fetch service attributes. Status: ${response.status}`);
    }

    const data = await response.json();

    return data;

  } catch (err) {
    ExceptionHandler.handle(err);
   // return null; 
   return {
    atributet: [],
    imageURL: null
  };
  }
}