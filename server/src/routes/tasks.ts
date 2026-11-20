import type { FastifyPluginAsync } from "fastify";
import type { NewTask, TaskPatch } from "../../../shared/types.js";
import type { TaskRepository } from "../lib/taskRepository.js";

const dateOrNull = { anyOf: [{ type: "string", format: "date" }, { type: "null" }] };
const title = { type: "string", minLength: 1, maxLength: 200, pattern: "\\S" };

export const taskRoutes: FastifyPluginAsync<{ tasks: TaskRepository }> = async (app, { tasks }) => {
  app.get("/", async () => tasks.list());

  app.post<{ Body: NewTask }>(
    "/",
    {
      schema: {
        body: {
          type: "object",
          required: ["title"],
          additionalProperties: false,
          properties: { title, due: dateOrNull },
        },
      },
    },
    async (req, reply) => reply.code(201).send(await tasks.create(req.body)),
  );

  app.patch<{ Params: { id: string }; Body: TaskPatch }>(
    "/:id",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          minProperties: 1,
          properties: { title, due: dateOrNull, done: { type: "boolean" } },
        },
      },
    },
    async (req, reply) => {
      const updated = await tasks.update(req.params.id, req.body);
      if (!updated) return reply.code(404).send({ error: "No task with that id." });
      return updated;
    },
  );

  app.delete<{ Params: { id: string } }>("/:id", async (req, reply) => {
    const removed = await tasks.remove(req.params.id);
    if (!removed) return reply.code(404).send({ error: "No task with that id." });
    return reply.code(204).send();
  });
};
