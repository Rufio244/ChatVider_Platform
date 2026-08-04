class AB_ReasoningEngine {
  constructor() { this.knowledgeNodes = []; }

  processInput(data, context) {
    const result = { topics:[], related:[], actions:[] };
    result.topics = this.extractTopics(data);
    result.related = this.findConnections(result.topics);
    result.actions = this.suggestActions(result, context);
    return result;
  }

  extractTopics(text) {
    return text.match(/[ก-ฮa-zA-Z0-9]+/g)?.slice(0,8) || [];
  }

  findConnections(topics) {
    return this.knowledgeNodes.filter(n => topics.some(t => n.relatesTo.includes(t)));
  }

  suggestActions(analysis, context) {
    return [{type:"store", desc:"บันทึกความรู้"}, {type:"adapt", desc:"ปรับตามผู้ใช้"}];
  }

  addKnowledge(topic, content) {
    this.knowledgeNodes.push({topic, content, added:new Date()});
  }
}
module.exports = AB_ReasoningEngine;

