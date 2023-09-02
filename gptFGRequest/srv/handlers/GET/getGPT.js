const fs = require("fs");
const gpt = async (req) => {
    const { Configuration, OpenAIApi } = require("openai");
    const configuration = new Configuration({
        organization: "<org>>",
        apiKey: '<apiKey>',
    });
    // const content = fs.readFileSync("req.txt");
    // const fileContent = content.toString();
    const openai = new OpenAIApi(configuration);
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{"role": "system", "content": "You are a helpful assistant."}, {role: "user", content:req.data.input}],
    });
    // console.log(completion.data.choices[0].message);
    return completion.data.choices[0].message.content;
  };

module.exports = {
    gpt
  };
  