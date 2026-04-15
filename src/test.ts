const TEST_TEXT = 'Breaking news: Scientists discover a new approach to treat cancer using AI-powered drug design. The revolutionary method shows promising results in clinical trials.';

const TEXT_MODELS_V1 = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

const TEXT_MODELS_BETA = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-002',
  'gemini-1.5-pro',
  'gemini-pro',
];

const IMAGE_MODELS = [
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-exp-image-generation',
];

async function testTextModel(apiKey: string, model: string, useBeta: boolean): Promise<boolean> {
  const version = useBeta ? 'v1beta' : 'v1';
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Translate to Vietnamese: ${TEST_TEXT}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
        }),
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(`✅ ${model} (${version}): SUCCESS`);
      if (text) console.log(`   -> ${text.substring(0, 100)}...`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ ${model} (${version}): ${error.substring(0, 150)}`);
      return false;
    }
  } catch (e) {
    console.log(`❌ ${model}: ${e}`);
    return false;
  }
}

async function testImageModel(apiKey: string, model: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Generate an image of a cute cat sitting on a chair' }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
        }),
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${model}: RESPONSE:`, JSON.stringify(data).substring(0, 300));
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ ${model}: ${error.substring(0, 150)}`);
      return false;
    }
  } catch (e) {
    console.log(`❌ ${model}: ${e}`);
    return false;
  }
}

async function testGeminiModels() {
  const keys = [
    'AIzaSyD1Oy893RbSPneG4pNz1i5YNHm6fWtaI8Y',
    'AIzaSyAXF3Qb_BC0xm0muzxH7YfeSDPCmMhIRiM',
  ];
  
  for (const key of keys) {
    console.log(`\n===== Testing key: ${key.substring(0, 15)}... =====\n`);
    
    console.log('=== TEXT MODELS (v1) ===');
    for (const model of TEXT_MODELS_V1) {
      await testTextModel(key, model, false);
    }
    
    console.log('\n=== TEXT MODELS (v1beta) ===');
    for (const model of TEXT_MODELS_BETA) {
      await testTextModel(key, model, true);
    }
    
    console.log('\n=== IMAGE MODELS ===');
    for (const model of IMAGE_MODELS) {
      await testImageModel(key, model);
    }
  }
}

testGeminiModels();