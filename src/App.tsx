import React from "react";
import "./App.css";

const config = {
  allowedMimeTypes: ["image/jpeg", "image/png"],
  maxFileSize: 1024 * 1024 * 5, // 5MB
};
export function App() {
  const getSignedPost = async (file: File) => {
    const url = "http://localhost:8092/graphql";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
    };

    const body = JSON.stringify({
      query: `
            mutation FileCreate {
                fileCreateUpload(input: { mimeType: "${file.type}", size: ${file.size} }) {
                    id
                    uploadUrl
                    fieldsJson
                }
            }
        `,
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body,
      });

      const result = await response.json();
      const data = result.data.fileCreateUpload;
      return {
        id: data.id,
        uploadUrl: data.uploadUrl,
        fields: JSON.parse(data.fieldsJson),
      };
    } catch (error) {
      console.error("Error creating file:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const file = (e.target as any).file.files[0];

    if (
      file.size > config.maxFileSize ||
      !config.allowedMimeTypes.includes(file.type)
    ) {
      console.error("File is too large or has an invalid file type");
    }

    const formData = new FormData();
    const signedPost = await getSignedPost(file);
    Object.entries(signedPost.fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    formData.append("file", file);

    const res = await fetch(signedPost.uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      console.log("File uploaded successfully", res.status);
    } else {
      console.error("Error uploading file", res.status, res.statusText);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>S3 upload file demo</h1>
      </header>
      <div>
        <form className="form" onSubmit={handleSubmit}>
          <input name="file" type="file" />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}
