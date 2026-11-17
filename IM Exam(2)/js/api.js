const BASE_URL= "https://rugby.highlightly.net";
const API_KEY = "39852f6f-1dae-4bf3-b93d-f011c910952c";
const TIMEOUT_MS = 8000;

class ApiError extends Error {
    constructor(kind, message){
        super(message);
        this.kind = kind;
    }
}

export async function apiFetch(path){
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let response;
    try{
        response = await fetch(BASE_URL + path, {
            headers: {"x-rapidapi-key": API_KEY},
            signal: controller.signal
        });
    } catch (err) {
        if(err.name === "AbortError"){
            throw new ApiError("timeout", "The server took too long to answer, Try again.");
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
    if(response.status === 429){
        throw new ApiError("quota", "Today's data limit has been reached. Come back tomorrow.");
    }
    if (response.status === 401 || response.status === 403)
    {
        throw new ApiError("key", "The data service refused our key");
    }
    if(!response.ok){
        throw new ApiError("server", "The data service had a problem. Try again later.");
    }
    return await response.json();
}

export const FIXTURES_TTL = 10 * 60 * 1000;
export const STANDINGS_TTL = 30 * 60 * 1000;

export async function cachedFetch(path, maxAgeMs){
    const cacheKey = "urc" + path;
    try{
        const saved = localStorage.getItem(cacheKey);
        if(saved){
            const entry = JSON.parse(saved);
            if (entry.data && Date.now() - entry.time < maxAgeMs){
                return entry.data;
            }
        }
    }catch (err){

    }
    const data = await apiFetch(path);
    try{
        localStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), data: data}));
    }catch(err){

    }
    return data;
}