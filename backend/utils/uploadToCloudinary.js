const cloudinary = require("cloudinary").v2;

exports.uploadToCloudinary = async (file, folder) => {

    const base64String =
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

    const response =
        await cloudinary.uploader.upload(
            base64String,
            {folder}
        );

    return response;

}