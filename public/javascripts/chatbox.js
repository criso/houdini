var App = window.App || {};

App.ChatBox = function (id, topicData) {
  var self = this;

  this.id = id || null;
  this.el = $(this.chatBoxTmpl({
    id: this.id,
    topic: topicData,
    user: App.Facebook.FBUser
  }));

  return this;
};


App.ChatBox.prototype = {

  el: $('<div/>', {'class': 'chat-box'}),

  chatBoxTmpl: _.template(
    '<div id="<%=id%>" class="chat-box">' +
      '<div class="chat-header">' +
        '<img  alt="Avatar for <%=topic.user.name%>" src="<%=topic.user.picture%>" class="you-say" />' +
        '<div class="topic-title"><%=topic.title%></div>' +
      '</div>' +
      '<ul class="messages"></ul>' +
      '<div class="chat-input">' +
        '<img  alt="Avatar for <%=user.name%>" src="<%=user.picture%>" class="you-say">' +
        '<form>' +
        '<textarea name="message" id="user-message" autofocus></textarea>' +
        '<button class="minimal button">Send</button' +
        '</form>' +
      '</div>' +
    '</div>'
  )

};
