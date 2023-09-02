from llama_index import GPTVectorStoreIndex, PromptHelper,SimpleDirectoryReader, LLMPredictor, ServiceContext, StorageContext, load_index_from_storage
# from langchain import OpenAI
from langchain.chat_models import ChatOpenAI
import gradio
import os
import openai

os.environ["OPENAI_API_KEY"] = 'sk-Your API Key'


def construct_index(directory_path):
    # set number of output tokens
    # num_outputs = 256
    
    max_input_size = 4096
    num_outputs = 2000
    max_chunk_overlap = 0.2
    chunk_size_limit = 800

    openai.api_key = os.environ["OPENAI_API_KEY"]

    prompt_helper = PromptHelper(max_input_size, num_outputs, max_chunk_overlap, chunk_size_limit=chunk_size_limit)

    _llm_predictor = LLMPredictor(llm=ChatOpenAI(temperature=0.5, model_name="gpt-3.5-turbo-16k-0613", max_tokens=num_outputs))

    service_context = ServiceContext.from_defaults(llm_predictor=_llm_predictor,prompt_helper=prompt_helper)

    docs = SimpleDirectoryReader(directory_path).load_data()

    index = GPTVectorStoreIndex.from_documents(docs, service_context=service_context)
    
    #Directory in which the indexes will be stored
    index.storage_context.persist(persist_dir="indexes")

    return index

def chatbot(input_text):
    
    # rebuild storage context
    storage_context = StorageContext.from_defaults(persist_dir="indexes")
    
    #load indexes from directory using storage_context 
    query_engne = load_index_from_storage(storage_context).as_query_engine()
    
    response = query_engne.query(input_text)
    
    #returning the response
    return response.response

#Creating the web UIusing gradio
iface = gradio.Interface(fn=chatbot,
                    height=300,
                    theme="soft",
                     inputs=gradio.inputs.Textbox(lines=5, label="Enter your question here"),
                     outputs="text",
                     title="Hey Lets talk about SAP and Its Cloud Products..")

#Constructing indexes based on the documents in traininData folder
#This can be skipped if you have already trained your app and need to re-run it
index = construct_index("trainingData")

#launching the web UI using gradio
iface.launch(share=True)

# def construct_index(directory_path):
#     max_input_size = 4096
#     num_outputs = 512
#     max_chunk_overlap = 0.1
#     chunk_size_limit = 600
    
#     openai.api_key = os.environ["OPENAI_API_KEY"]
    
#     prompt_helper = PromptHelper(max_input_size, num_outputs, max_chunk_overlap, chunk_size_limit=chunk_size_limit)

#     llm_predictor = LLMPredictor(llm=OpenAI(temperature=0.7, model_name="text-davinci-003", max_tokens=num_outputs))

#     documents = SimpleDirectoryReader(directory_path).load_data()

#     index = GPTVectorStoreIndex(documents, llm_predictor=llm_predictor, prompt_helper=prompt_helper)

#     index.storage_context.persist()

#     return index

# def chatbot(input_text):
#     index = GPTVectorStoreIndex.load_from_disk('C:\\Users\\Yoga\Documents\\gptTraining\\gptTrain.csv')
#     response = index.query(input_text, response_mode="compact")
#     return response.response

# iface = gr.Interface(fn=chatbot,
#                      inputs=gr.inputs.Textbox(lines=7, label="how do you find ABAp"),
#                      outputs="text",
#                      title="My AI Chatbot")

# index = construct_index("C:\\Users\\Yoga\Documents\\gptTraining")
# iface.launch(share=True)