from modal import (
    Image,
    App,
    method,
    asgi_app,
    functions,
    enter,
    build,
)
from fastapi import Request, FastAPI, responses
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import time
MODEL_DIR = "/model"

# Initialize FastAPI app
web_app = FastAPI(docs=True)

# Add CORS middleware to allow cross-origin requests from any origin
web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define dependencies to run sdxl model
image = (
    Image.debian_slim()
    .pip_install(
        "diffusers", 
        "transformers", 
        "accelerate",
        "hf-transfer~=0.1"
    )
    .pip_install("peft")
    .pip_install("fastapi[standard]")
)


# Define the app
app = App("sdxl-main", image=image)


with image.imports():
    from diffusers import AutoPipelineForText2Image
    import torch
    import io
    import os
from fastapi import Response

@app.cls( 
    gpu=["H100", "A100-40GB:2"],
    allow_concurrent_inputs=80,
    container_idle_timeout=40,
)
class Model:
    @enter()
    @build()
    def load_weights(self):
        """
        Load the pre-trained SDXL model and initialize the pipeline.
        """
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
        self.pipe = AutoPipelineForText2Image.from_pretrained(
            "stabilityai/sdxl-turbo",
            torch_dtype=self.torch_dtype,
            variant="fp16"
        )
        self.pipe.to(self.device)


    @method()
    def generate(self, prompt: str = "A cinematic shot of a baby racoon wearing an intricate italian priest robe."):
        """
        Generate an image based on the provided prompt.

        Args:
            prompt (str): The text prompt to generate the image.

        Returns:
            Tuple[bytes, float]: The generated image in bytes and the elapsed time.
        """
        start_time = time.time()
        print(f"Generating image for prompt: {prompt}")
        image = self.pipe(
            prompt=prompt, 
            num_inference_steps=1, 
            guidance_scale=0.0,
            return_timestamps=True  # May only apply to audio models
        ).images[0]
        image_bytes = io.BytesIO()
        image.save(image_bytes, format="PNG")
        elapsed_time = time.time() - start_time
        print(f"Time taken: {elapsed_time} seconds")
        return image_bytes.getvalue(), elapsed_time




# Endpoint to start image generation asynchronously
@app.function()
@web_app.post("/generate")
async def generate_image(request: Request):
    """
    Start the image generation process asynchronously.

    Args:
        request (Request): Incoming HTTP request.

    Returns:
        dict: A dictionary containing the call_id to retrieve the result later.
    """
    print("Received a request from", request.client)
    data = await request.form()
    prompt = data.get("prompt", "A cinematic shot of a baby racoon wearing an intricate italian priest robe.")
    model = Model()
    call = model.generate.spawn(prompt)
    return {"call_id": call.object_id}



# Endpoint to retrieve the result using call_id
@app.function()
@web_app.get("/result")
async def get_result(request: Request):
    """
    Retrieve the generated image result using a call_id.

    Args:
        request (Request): Incoming HTTP request containing call_id query parameter.

    Returns:
        Response: PNG image response with elapsed time header if ready,
                 or 202 status with message if still processing.
    """
    call_id = request.query_params.get("call_id")
    if not call_id:
        return {"error": "No call_id provided"}
    
    f = functions.FunctionCall.from_id(call_id)
    try:
        image_bytes, elapsed_time = f.get(timeout=0)
        return Response(
            content=image_bytes,
            media_type="image/png",
            headers={"X-Elapsed-Time": f"{elapsed_time:.2f} seconds"}
        )
    except TimeoutError:
        return responses.JSONResponse(
            content="Result not ready yet",
            status_code=202
        )

@web_app.get("/stats")
async def get_stats(request: Request):
    """
    Get the current statistics of the model.

    Args:
        request (Request): Incoming HTTP request.

    Returns:
        dict: Current statistics of the model.
    """
    print("Received a request from", request.client)
    model = Model()
    f = model.generate
    return f.get_current_stats()


@app.function()
@asgi_app()
def entrypoint():
    """
    ASGI application entry point for the web app.
    """
    return web_app
