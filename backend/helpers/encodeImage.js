// Helper function to base64 encode image
export const encodeImage = (buffer) => {
    return Buffer.from(buffer).toString('base64');
};