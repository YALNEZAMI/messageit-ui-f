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
    multiples: false,
    uploadDir: tmpDir,
    keepExtensions: true,
  });

  const { files, fields } = await new Promise((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const uploaded = files.profilePhoto;
  if (!uploaded) {
    throw createError({
      statusCode: 400,
      statusMessage: "Aucun fichier reçu.",
    });
  }

  const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;
  const fileData = await readFile(file.filepath);
  const ext = "." + file.originalFilename.split(".").pop();
  const uploadPath = join(
    process.cwd(),
    "public/uploads/profilesPhotos",
    fields.idUser.toString() + ext || "upload.dat" + ext
  );

  await mkdir(join(process.cwd(), "public/uploads"), { recursive: true });
  await mkdir(join(process.cwd(), "public/uploads/profilesPhotos"), {
    recursive: true,
  });

  await writeFile(uploadPath, fileData);
  // ✅ Delete temp file after writing it
  await unlink(file.filepath);
  return {
    message: "Fichier uploadé",
    path:
      useRuntimeConfig().public.BASE_URL +
      `/uploads/profilesPhotos/${fields.idUser.toString() + ext}`,
    filename: file.originalFilename,
  };
});
