
async function debug() {
    console.log("Fetching profiles...");
    const profilesRes = await fetch('https://api.dexscreener.com/token-profiles/latest/v1');
    const profiles = await profilesRes.json();
    console.log(`Found ${profiles.length} profiles.`);

    const addresses = profiles.slice(0, 5).map((p: any) => p.tokenAddress).join(',');
    console.log(`Fetching market data for: ${addresses}`);

    const marketRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addresses}`);
    const marketData = await marketRes.json();

    // console.log("Market Data Pairs sample:", JSON.stringify(marketData.pairs[0], null, 2));

    const pairs = marketData.pairs;
    profiles.slice(0, 5).forEach((p: any) => {
        // Find pairs for this token
        const tokenPairs = pairs.filter((pair: any) => pair.baseToken.address.toLowerCase() === p.tokenAddress.toLowerCase());
        console.log(`Token ${p.tokenAddress} has ${tokenPairs.length} pairs.`);
        if (tokenPairs.length > 0) {
            const bestPair = tokenPairs[0]; // Just taking first for inspect
            console.log(`  Volume h24:`, bestPair.volume?.h24);
        } else {
            console.log("  No pairs found? Check case sensitivity.");
            // Log if we can find it with different casing
            const looseMatch = pairs.find((pair: any) => pair.baseToken.address === p.tokenAddress);
            if (looseMatch) console.log("  Found strict match though?");
        }
    });
}

debug();
