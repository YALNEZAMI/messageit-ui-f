// server/api/upload.ts
import { writeFile, readFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default defineEventHandler(async (event) => {
  const tmpDir = join(process.cwd(), "uploads/tmp");
  await mkdir(tmpDir, { recursive: true });

  const form = formidable({
    multiples: true,
    uploadDir: tmpDir,
    keepExtensions: true,
  });

  const { files, fields } = await new Promise((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const uploadedFiles = files.files as any[];
  if (!uploadedFiles) {
    throw createError({
      statusCode: 400,
      statusMessage: "Aucun fichier reçu.",
    });
  }
  const urls: string[] = [];
  for (const file of uploadedFiles) {
    const fileData = await readFile(file.filepath);
    const ext = "." + file.originalFilename.split(".").pop();
    const id =
      Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const name =
      fields.idConversation.toString() + "--" + id + ext || "upload.dat" + ext;
    const uploadPath = join(process.cwd(), "public/uploads/messageFiles", name);

    await mkdir(join(process.cwd(), "public/uploads/messageFiles"), {
      recursive: true,
    });

    await writeFile(uploadPath, fileData);
    urls.push(
      useRuntimeConfig().public.BASE_URL + `/uploads/messageFiles/${name}`
    );

    await unlink(file.filepath);
  }

  return {
    message: "Fichiers uploadés",
    urls,
  };
});
