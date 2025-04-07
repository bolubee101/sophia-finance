import pdfParse from 'pdf-parse';

const parsePdf = async (buffer: Buffer): Promise<{ text: string; numpages: number }> => {
  const data = await pdfParse(buffer);
  return { text: data.text, numpages: data.numpages };
};

export default parsePdf;
