const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;
const LEONARDO_MODEL_ID = "aa77f04e-3eec-4034-9c07-d0f619684628"; // Leonardo KinoXl
let lastPrompt = "";
let lastGenerationId = null;

async function generateImage(
  imagePrompt,
  isColoringBook = false,
  uploadedImageId = null,
) {
  console.log("Generating image with:", {
    imagePrompt,
    isColoringBook,
    uploadedImageId,
  });

  try {
    const enhancedPrompt = enhancePrompt(imagePrompt, isColoringBook);
    lastPrompt = enhancedPrompt;

    const generationBody = {
      prompt: enhancedPrompt,
      modelId: LEONARDO_MODEL_ID,
      num_images: 1,
      width: 1024,
      height: 1024,
      negative_prompt: getNegativePrompt(isColoringBook),
      init_strength: isColoringBook ? 0.4 : 0.7,
      guidance_scale: isColoringBook ? 8 : 7,
    };

    if (uploadedImageId) {
      console.log("Adding controlnet for uploaded image:", uploadedImageId);
      const controlNet = {
        initImageId: uploadedImageId,
        initImageType: "UPLOADED",
        preprocessorId: 133, // Character Reference preprocessor
        strengthType: "Mid",
      };
      generationBody.controlnets = [controlNet];
      console.log("Generation body with controlnet:", JSON.stringify(generationBody, null, 2));
    }

    const createOptions = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify(generationBody),
    };

    const generation = await fetch(
      "https://cloud.leonardo.ai/api/rest/v1/generations",
      createOptions,
    ).then((res) => res.json());

    console.log("Leonardo generation response:", generation);

    if (generation.error) {
      throw new Error(`Leonardo API error: ${generation.error}`);
    }

    const generationId = generation.sdGenerationJob?.generationId;
    if (!generationId) {
      throw new Error("No generation ID received from Leonardo API");
    }

    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (!imageUrl && attempts < maxAttempts) {
      const pollOptions = {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${LEONARDO_API_KEY}`,
        },
      };

      const result = await fetch(
        `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
        pollOptions,
      ).then((res) => res.json());

      console.log("Poll attempt", attempts + 1, "result:", result);

      if (
        result.generations_by_pk?.status === "COMPLETE" &&
        result.generations_by_pk.generated_images?.length > 0
      ) {
        imageUrl = result.generations_by_pk.generated_images[0].url;
        break;
      } else if (result.generations_by_pk?.status === "FAILED") {
        throw new Error("Image generation failed");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!imageUrl) {
      throw new Error("Image generation timed out or failed");
    }

    return imageUrl;
  } catch (error) {
    console.error("Error in image generation:", error);
    throw error;
  }
}

async function pollGenerationCompletion(generationId, maxAttempts = 30) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await fetch(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${LEONARDO_API_KEY}`,
        },
      },
    ).then((res) => res.json());

    if (result.status === "COMPLETE") {
      return result;
    } else if (result.status === "FAILED") {
      throw new Error("Generation failed");
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("Generation timed out");
}

function enhancePrompt(basePrompt, isColoringBook) {
  const characterReference = "Maintain consistent character appearance across generations. ";
  
  const stylePrompt = isColoringBook
    ? "Create a clear, black and white line drawing suitable for a coloring book. Sharp outlines, minimal shading, distinct elements, child-friendly style."
    : "Create a vibrant, detailed illustration for a children's fairytale book. Magical atmosphere, soft lighting, child-friendly style.";

  return `${characterReference}${basePrompt}. ${stylePrompt} High quality, professional illustration, centered composition, full scene visualization.`;
}

function getNegativePrompt(isColoringBook) {
  return isColoringBook
    ? "color, shading, gradient, photorealistic, complex backgrounds, blur, watermark, signature, realistic textures, gray tones"
    : "ugly, blurry, low quality, distorted, deformed, pixelated, amateur, unprofessional, watermark, signature";
}

async function postProcessColoringImage(imageUrl) {
  try {
    const variation = await leonardo.variations.createVariation({
      imageUrl: imageUrl,
      prompt:
        "Convert to clean black and white line art, perfect for coloring books. Clear outlines, no shading, high contrast.",
      modelId: LEONARDO_MODEL_ID,
      negative_prompt:
        "color, shading, gradient, photorealistic, complex backgrounds",
      num_images: 1,
      width: 1024,
      height: 1024,
      guidance_scale: 8,
      init_strength: 0.4,
    });

    const result = await pollGenerationCompletion(variation.id);
    return result.generated_images[0].url;
  } catch (error) {
    console.error("Error in coloring book post-processing:", error);
    return imageUrl; // Fallback to original image if post-processing fails
  }
}

async function getVariations(imageUrl, count = 4) {
  if (!lastGenerationId) {
    throw new Error("No previous generation found");
  }

  try {
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
        prompt: lastPrompt,
        modelId: LEONARDO_MODEL_ID,
        num_images: count,
        width: 1024,
        height: 1024,
      }),
    };

    const variation = await fetch(
      "https://cloud.leonardo.ai/api/rest/v1/variations",
      options,
    ).then((res) => res.json());

    const result = await pollGenerationCompletion(variation.id);
    return result.generated_images.map((img) => img.url);
  } catch (error) {
    console.error("Error generating variations:", error);
    throw error;
  }
}

function getLastPrompt() {
  return lastPrompt;
}

async function uploadImage(file) {
  try {
    // Step 1: Get presigned URL
    const initOptions = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        extension: file.originalname.split(".").pop(),
      }),
    };

    const initResponse = await fetch(
      "https://cloud.leonardo.ai/api/rest/v1/init-image",
      initOptions,
    );
    const initData = await initResponse.json();

    if (!initResponse.ok || !initData.uploadInitImage) {
      throw new Error(
        `Failed to initialize upload: ${initData.error || "Unknown error"}`,
      );
    }

    // Step 2: Upload to presigned URL
    const { url, fields, id } = initData.uploadInitImage;
    const formData = new FormData();

    // Add all fields from the presigned URL response
    Object.entries(JSON.parse(fields)).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Add the file last
    formData.append("file", new Blob([file.buffer], { type: file.mimetype }));

    const uploadResponse = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload image to storage");
    }

    console.log("Image upload successful:", {
      imageId: id,
      fileName: file.originalname,
    });

    return id;
  } catch (error) {
    console.error("Error uploading image to Leonardo:", error);
    throw error;
  }
}

module.exports = {
  generateImage,
  getVariations,
  getLastPrompt,
  uploadImage,
};
