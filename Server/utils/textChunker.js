// Spilit text into chunks for beeter ai responces

import { raw } from "express";

export const chunkText = (text , chunkSize = 500 , overlap = 50) => {
    if(!text || text.trim().length === 0){
        return []
    }

    const cleanedText = text
        .replace(/\r\n/g , '\n')
        .replace(/\s+/g , ' ')
        .replace(/\n /g , '\n')
        .replace(/\n/g , '\n')
        .trim();

    const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0)
    const chunks = [];
    let currentChunk = []
    let currentWordCount = 0
    let chunkIndex = 0;

    for(const para of paragraphs){
        const paraWords = para.trim().split(/\s+/)
        const paraWordCount = paraWords.length;

        if(paraWordCount > chunkSize){
            if(currentChunk.length > 0){
                chunks.push({
                    content : currentChunk.join('\n\n'),
                    chunkIndex : chunkIndex++,
                    pageNumber : 0
                })
                currentChunk = []
                currentWordCount = 0
            }

            for(let i = 0 ; i < paraWords.length ; i += (chunkSize - overlap)){
                const chunkWords = paraWords.slice(i , i + chunkSize)
                chunks.push({
                    content : chunkWords.join(' '),
                    chunkIndex : chunkIndex++,
                    pageNumber : 0
                })

                if(i + chunkSize >= paraWords.length) break;
            }
            continue
        }


        if(currentWordCount + paraWordCount > chunkSize && currentChunk.length > 0){
            chunks.push({
                content : currentChunk.join('\n\n'),
                chunkIndex : chunkIndex++,
                pageNumber : 0
            })
            
            // Create overlap
            const prevChunkText = currentChunk.join(' ')
            const prevWords = prevChunkText.split(/\s+/)
            const overlapText = prevWords.slice(-Math.min(overlap , prevWords.length)).join(' ')

            currentChunk = [overlapText , para.trim()]
            currentWordCount = overlapText.split(/\s+/).length + paraWordCount
        }
        else{
            currentChunk.push(para.trim())
            currentWordCount += paraWordCount
        }
    }

    // Add alst chunk
    if(currentChunk.length > 0){
        chunks.push({
            content : currentChunk.join('\n\n'),
            chunkIndex : chunkIndex,
            pageNumber : 0
        })
    }

    // Fallback : if no chunks created , split by words
    if(chunks.length === 0 && cleanedText.length > 0){
        const allWords = cleanedText.split(/\s+/)
        for(let i = 0 ; i < allWords.length ; i += (chunkSize - overlap)){
            const chunkWords = allWords.slice(i , i + chunkSize)
            chunks.push({
                content : chunkWords.join(' '),
                chunkIndex : chunkIndex++,
                pageNumber : 0
            })

            if(i + chunkSize >= allWords.length) break;
        }
    }

    return chunks;
}

// Find Relevent Chunks based on keywords matching
export const findReleventChunks = (chunks , query , maxChunks = 3) => {
    if(!query || chunks.trim().length === 0 || !chunks){
        return []
    }

    const stopWords = new Set([
        'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'this', 'that', 'it'
    ])

    const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .filter(w=> w.length > 2 && !stopWords.has(w))

    if(queryWords.length === 0){
        return chunks.slice(0 , maxChunks).map(chunk => ({
            content : chunk.content,
            chunkIndex : chunk.chunkIndex,
            pageNumber : chunk.pageNumber,
            _id : chunk._id
        }))
    }
    
    const scoredChunks = chunks.map((chunk , index)=>{
        const content = chunk.content.toLowerCase()
        const contentWords = content.split(/\s+/).length
        let score = 0

        for (const word of queryWords) {
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            // Exact word match (higher score)
            const exactMatches =
            (content.match(new RegExp(`\\b${escapedWord}\\b`, "gi")) || []).length;

            score += exactMatches * 3;

            // Partial match (lower score)
            const partialMatches =
            (content.match(new RegExp(escapedWord, "gi")) || []).length;

            score += Math.max(0, partialMatches - exactMatches) * 1.5;
        }

        // 2️⃣ Bonus: Multiple query words found
        const uniqueWordsFound = queryWords.filter(word =>
            content.includes(word)
        ).length;

        if (uniqueWordsFound > 1) {
            score += uniqueWordsFound * 2;
        }

        // 3️⃣ Normalize by content length
        const normalizedScore = score / Math.sqrt(contentWords);

        // 4️⃣ Small bonus for earlier chunks
        const positionBonus = 1 - (index / chunksLength) * 0.1;

        // 5️⃣ Final score
        const finalScore = normalizedScore * positionBonus;

        // 6️⃣ Return clean object (no DB metadata)
        return {
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: finalScore,
            rawScore: score,
            matchWords: uniqueWordsFound
        };
    })

    return scoredChunks
    .filter(chunk => chunk.score > 0)
    .sort((a,b)=>{
        if(b.score !== a.score){
            return b.score - a.score
        }
        if(b.matchWords !== a.matchWords){
            return b.matchWords - a.matchWords
        }
        return a.chunkIndex - b.chunkIndex
    })
    .slice(0 , maxChunks)
}