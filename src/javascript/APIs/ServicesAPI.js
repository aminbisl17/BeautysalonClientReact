import { ExceptionHandler } from "../Exceptions/ExceptionHandler";
import { TokenException } from "../Exceptions/TokenException";

export async function fetchServices() {

  try {
    const response = await fetch(
      process.env.REACT_APP_SERVICES_GET_ALL,
      {
        method: "GET"
     //   headers: {
       //   Authorization: `Bearer ${token}`,
     //   },
      }
    );
    if (response.status === 401 || response.status === 403) {
      throw new TokenException();
    }

    // Handle other errors
    if (!response.ok) {
      throw new Error("Request failed");
    }
const data = await response.json();

const servicesWithImages = data.map((ser) => {
  if (ser.imagePath) {
    return {
      ...ser,
      imageURL: `data:image/jpeg;base64,${ser.imagePath}`,
    };
  } else {
    return {
      ...ser,
      imageURL: null,
    };
  }
});

return servicesWithImages;

  } catch (err) {
 //   ExceptionHandler.handle(err);
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

       if (data.imagePath) {
    
     // data.imageURL = `data:image/jpeg;base64,${data.imagePath}`;
     data.imageURL = data.imagePath;
    } else {
      data.imageURL = null; 
   
    }
    
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