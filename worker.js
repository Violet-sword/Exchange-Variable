addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

// Define the KV namespace key and content key for easy updates
const KV_NAMESPACE = TEXT_CONTENT;  // Replace 'TEXT_CONTENT' with your desired KV namespace
const CONTENT_KEY = 'currentText';   // The key used for storing/retrieving content in KV

// Function to generate common response headers
function getResponseHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain'
    };
}

async function handleRequest(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
        // Handle CORS preflight request
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    }

    const urlParam = url.searchParams.get('stored-text');  // Check for the 'stored-text' parameter

    if (urlParam) {
        // Update content if 'stored-text' parameter is present
        try {
            await KV_NAMESPACE.put(CONTENT_KEY, urlParam);  // Store the new value in KV
            return new Response(urlParam, {
                status: 200,
                headers: getResponseHeaders()
            });
        } catch (err) {
            console.error('Failed to update content:', err);  // Log the error
            return new Response('Failed to update content', {
                status: 500,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }
    } else {
        // Fetch and return content if no 'stored-text' parameter is present
        try {
            const currentText = await KV_NAMESPACE.get(CONTENT_KEY) || 'Hello World';  // Fallback to 'Hello World'
            return new Response(currentText, {
                status: 200,
                headers: getResponseHeaders()
            });
        } catch (err) {
            console.error('Failed to retrieve content:', err);  // Log the error
            return new Response('Failed to retrieve content', {
                status: 500,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }
    }
}
