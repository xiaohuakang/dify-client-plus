import axios from "axios";
export const BASE_URL = "https://api.dify.ai/v1";

export const routes = {
  application: {
    method: "GET",
    url: () => `/parameters`,
  },
  feedback: {
    method: "POST",
    url: (message_id) => `/messages/${message_id}/feedbacks`,
  },
  createChatMessage: {
    method: "POST",
    url: () => `/chat-messages`,
  },
  getConversationMessages: {
    method: "GET",
    url: () => `/messages`,
  },
  getConversations: {
    method: "GET",
    url: () => `/conversations`,
  },
  renameConversation: {
    method: "POST",
    url: (conversation_id) => `/conversations/${conversation_id}/name`,
  },
  deleteConversation: {
    method: "DELETE",
    url: (conversation_id) => `/conversations/${conversation_id}`,
  },
  fileUpload: {
    method: "POST",
    url: () => `/files/upload`,
  },
  getMeta: {
    method: "GET",
    url: () => `/meta`,
  },
  getInfo: {
    method: "GET",
    url: () => `/info`,
  },
  aduioToText: {
    method: "POST",
    url: () => `/audio-to-text`,
  },
  textToAudio: {
    method: "POST",
    url: () => `/text-to-audio`,
  },
  getSuggested: {
    method: "GET",
    url: (message_id) => `/messages/${message_id}/suggested`,
  },
  stopChat: {
    method: "POST",
    url: (task_id) => `/chat-messages/${task_id}/stop`,
  },
  runWorkflow: {
    method: "POST",
    url: () => `/workflows/run`,
  },
  checkWorkflow: {
    method: "GET",
    url: (workflow_id) => `/workflows/run/${workflow_id}`,
  },
  stopWorkflow: {
    method: "POST",
    url: (task_id) => `/workflows/tasks/${task_id}/stop`,
  },
  getWorkflowLogs: {
    method: "GET",
    url: () => `/workflows/logs`,
  },
};

export class DifyClient {
  constructor(apiKey, baseUrl = BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  updateApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  async sendRequest(
    method,
    endpoint,
    data = null,
    params = null,
    stream = false,
    headerParams = {}
  ) {
    const headers = {
      ...{
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      ...headerParams
    };

    const url = `${this.baseUrl}${endpoint}`;
    let response;
    if (stream) {
      response = await axios({
        method,
        url,
        data,
        params,
        headers,
        responseType: "stream",
      });
    } else {
      response = await axios({
        method,
        url,
        ...(method !== "GET" && { data }),
        params,
        headers,
        responseType: "json",
      });
    }

    return response;
  }

  messageFeedback(message_id, rating, user) {
    const data = {
      rating,
      user,
    };
    return this.sendRequest(
      routes.feedback.method,
      routes.feedback.url(message_id),
      data
    );
  }

  getApplicationParameters(user) {
    const params = { user };
    return this.sendRequest(
      routes.application.method,
      routes.application.url(),
      null,
      params
    );
  }
  getInfo(user) {
    const params = { user };
    return this.sendRequest(
      routes.getInfo.method,
      routes.getInfo.url(),
      null,
      params
    );
  }
  fileUpload(data) {
    return this.sendRequest(
      routes.fileUpload.method,
      routes.fileUpload.url(),
      data,
      null,
      false,
      {
        "Content-Type": 'multipart/form-data'
      }
    );
  }
  aduioToText(data) {
    return this.sendRequest(
      routes.aduioToText.method,
      routes.aduioToText.url(),
      data,
      null,
      false,
      {
        "Content-Type": 'multipart/form-data'
      }
    );
  }
  textToAudio(data) {
    return this.sendRequest(
      routes.textToAudio.method,
      routes.textToAudio.url(),
      data,
      null,
      false,
      {
        "Content-Type": 'multipart/form-data'
      }
    );
  }
}

export class WorkflowClient extends DifyClient {
  checkWorkflow(workflow_id) {
    return this.sendRequest(
      routes.checkWorkflow.method,
      routes.checkWorkflow.url(workflow_id),
      null
    );
  }
  stopWorkflow(task_id, user) {
    const data = { user };
    return this.sendRequest(
      routes.stopWorkflow.method,
      routes.stopWorkflow.url(task_id),
      data
    );
  }
  getWorkflowLogs(keyword, status, page = 1, limit = null) {
    const params = { keyword, status, page, limit };
    return this.sendRequest(
      routes.getWorkflowLogs.method,
      routes.getWorkflowLogs.url(),
      null,
      params
    );
  }
  runWorkflow(inputs, user, stream = false, files = null) {
    const data = {
      inputs,
      user,
      response_mode: stream ? "streaming" : "blocking",
    };
    return this.sendRequest(
      routes.runWorkflow.method,
      routes.runWorkflow.url(),
      data,
      null,
      stream
    );
  }
}

export class ChatClient extends DifyClient {
  createChatMessage(
    inputs,
    query,
    user,
    stream = false,
    conversation_id = null,
    files = null
  ) {
    const data = {
      inputs,
      query,
      user,
      response_mode: stream ? "streaming" : "blocking",
      files,
    };
    if (conversation_id) data.conversation_id = conversation_id;

    return this.sendRequest(
      routes.createChatMessage.method,
      routes.createChatMessage.url(),
      data,
      null,
      stream
    );
  }

  getConversationMessages(
    user,
    conversation_id = "",
    first_id = null,
    limit = null
  ) {
    const params = { user };

    if (conversation_id) params.conversation_id = conversation_id;

    if (first_id) params.first_id = first_id;

    if (limit) params.limit = limit;

    return this.sendRequest(
      routes.getConversationMessages.method,
      routes.getConversationMessages.url(),
      null,
      params
    );
  }

  getConversations(user, first_id = null, limit = null, pinned = null) {
    const params = { user, first_id: first_id, limit, pinned };
    return this.sendRequest(
      routes.getConversations.method,
      routes.getConversations.url(),
      null,
      params
    );
  }

  renameConversation(conversation_id, name, user, auto_generate) {
    const data = { name, user, auto_generate };
    return this.sendRequest(
      routes.renameConversation.method,
      routes.renameConversation.url(conversation_id),
      data
    );
  }
  deleteConversation(conversation_id, user) {
    const data = { user };
    return this.sendRequest(
      routes.deleteConversation.method,
      routes.deleteConversation.url(conversation_id),
      data
    );
  }
  stopChat(task_id, user) {
    const data = { user };
    return this.sendRequest(
      routes.stopChat.method,
      routes.stopChat.url(task_id),
      data
    );
  }
  getSuggested(message_id, user) {
    const params = { user };
    return this.sendRequest(
      routes.getSuggested.method,
      routes.getSuggested.url(message_id),
      null,
      params
    );
  }
  getMeta(user) {
    const params = { user };
    return this.sendRequest(
      routes.getMeta.method,
      routes.getMeta.url(),
      null,
      params
    );
  }
}