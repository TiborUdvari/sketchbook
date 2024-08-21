export function sayHi() {
  console.log("hi");
}

/**
 * @param {string | URL | Request} url
 */
export async function loadShaderString(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Fetch response status: ${response.status}`);
    }
    const text = await response.text();
    return text;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}
