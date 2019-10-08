/**
@module azure-mobile-apps/src/queue

*/

const url = "amqp://localhost";

async function amqpCreateChannel({ url }) {
  const amqp = require("amqplib");
  const conn = await amqp.connect(url);
  const channel = await conn.createChannel();
  return channel;
}

async function worker({ queue }) {
  const channel = await amqpCreateChannel({ url });

  await channel.assertQueue(queue);

  await channel.consume(
    queue,
    msg => {
      console.log(msg.content.toString());
    },
    { noAck: false }
  );
}

async function add({ queue, message }) {
  const channel = await amqpCreateChannel({ url });

  await channel.sendToQueue(queue, Buffer.from(message), {
    contentType: "'application/json'"
  });
}
// const message = { test: "test1" };

module.exports = { worker, add };
// worker({ q });
// add({ q, message: JSON.stringify(message) });
