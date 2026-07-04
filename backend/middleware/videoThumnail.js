const sharp = require("sharp");

exports.validateVideoAndThumbnail =
async (req, res, next) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    "Thumbnail is required"
            });
        }


        const fileSizeMB =
            req.file.size /
            (1024 * 1024);

        if (
            fileSizeMB > 12
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Thumbnail size must be max 6MB and 12MB for videos"
            });
        }

        // buffer is image in binary form and .metadata() to get info of image 
        const metadata =
            await sharp(
                req.file.buffer
            ).metadata();

            console.log(metadata);

        const ratio =
            metadata.width /
            metadata.height;

        if (
            Math.abs(
                ratio - (16 / 9)
            ) > 0.01
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Thumbnail must have 16:9 aspect ratio"
            });
        }

        if (
            metadata.width < 1024 ||
            metadata.height < 576
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Minimum resolution is 1024x576"
            });
        }

        next();

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};