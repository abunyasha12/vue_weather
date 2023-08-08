export async function getFirstGoogleImageLink (queryEn: string): Promise<string> {
    let data 
    try {
        data = await fetch('https://customsearch.googleapis.com/customsearch/v1?' + new URLSearchParams({
                cx: "b1272b1fdb24543b9",
                imgType: 'photo',
                q: queryEn,
                safe: 'high',
                searchType: 'image',
                key: "AIzaSyC2ljaogRqlyTrNt93lc6DyTxqJC7YgaE4",
            })
            ).then(response => response.json())
        return data?.items[0].link
    } catch (e) {
        throw e
    }
}