import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  
  try {
    const generateResponse = await fetch(`${process.env.NEXT_PUBLIC_MODAL_URL}/generate`, {
      method: 'POST',
      body: formData,
    });
    
    const { call_id } = await generateResponse.json();
    
    let attempts = 0;
    while (attempts < 30) {
      const resultResponse = await fetch(`${process.env.NEXT_PUBLIC_MODAL_URL}/result?call_id=${call_id}`);
      
      if (resultResponse.status === 200) {
        const imageBuffer = await resultResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const elapsedTime = resultResponse.headers.get('X-Elapsed-Time');
        
        return NextResponse.json({
          image: `data:image/png;base64,${base64Image}`,
          elapsedTime,
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    throw new Error('Generation timed out');
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}