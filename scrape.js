const fs = require('fs');

async function searchLogitechImage(query) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:resource.logitech.com ' + query)}`;
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            }
        });
        const text = await res.text();
        const matches = text.match(/https:\/\/resource\.logitech\.com[^"']+/g);
        if (matches) {
            // Find the most relevant one (usually a png)
            const pngs = matches.filter(m => m.includes('.png'));
            // Return first decoded
            return pngs.length > 0 ? pngs[0] : matches[0];
        }
    } catch(e) {
        console.error(e);
    }
    return null;
}

const products = [
  { "id": "3716c9a0-87de-4bbf-b798-8225d367300a", "name": "Logitech MX Master 3S" },
  { "id": "3ff911a9-e432-4afd-b11a-8d7508bb13d6", "name": "Logitech MX Master 3S" },
  { "id": "ea86f544-75a5-4d42-aeac-5c7184735b78", "name": "Logitech MX Keys S" },
  { "id": "45830843-40c1-4d8e-87fb-ff1d2a509a77", "name": "Logitech G502 Hero" },
  { "id": "5bd9050b-3dbc-4154-9ea9-4a73bca6d1d4", "name": "Logitech Pebble Mouse 2 M350s" },
  { "id": "7a51d022-001c-48f2-952c-112fd1c627c3", "name": "Logitech G413 TKL SE" },
  { "id": "2c3b5e1d-73c7-491e-a977-cfd2b31850cb", "name": "Logitech Pebble Keys 2 K380s" },
  { "id": "8c2a9d26-86aa-493a-b739-7eae2f4eafcb", "name": "Logitech Lift" },
  { "id": "4598b626-699b-4d64-99db-c94fc7a900ed", "name": "Logitech C270 HD Webcam" },
  { "id": "25110206-5a47-4d0c-9137-59e91fc06740", "name": "Logitech Tablet Stand - Gris" },
  { "id": "ffc23e79-2b94-4acb-af11-4dffef1587d7", "name": "Logitech POP Mouse" },
  { "id": "6b014aed-8068-4656-8bd1-e393b278bfd5", "name": "Logitech Signature M650" },
  { "id": "6ebd8abc-a8f2-47ed-835c-ae36d3a750ed", "name": "Logi USB Type-C to USB Type-C Cable" },
  { "id": "dd4c6362-d539-40ac-a7c7-b849e43202d2", "name": "MX Anywhere 3S" },
  { "id": "a1f35c57-57fd-4eab-84ad-8714b397adff", "name": "G413 TKL SE" },
  { "id": "c593bcdf-9562-4327-a671-abfcb7b12d30", "name": "G213 Prodigy" },
  { "id": "3af94822-0fa0-4ac6-9532-c392e26383a5", "name": "G703 Mouse" },
  { "id": "94704673-8f11-457b-ac11-c7a216975278", "name": "G502 LIGHTSPEED" },
  { "id": "1c856137-43a9-458f-a7e3-c1d7fe8d97ff", "name": "G502 X PLUS" },
  { "id": "0d1a92b4-f730-4af5-94dd-9be25d26e7ec", "name": "Signature Slim" },
  { "id": "7071afbc-3553-4b1a-b210-b88fb79054b2", "name": "MX Master 3S" },
  { "id": "f035f4c8-cc08-4ea8-a64d-851828b5be2f", "name": "POP Icon Keys" },
  { "id": "c8a2d0fd-d912-4257-941a-00e05d9de83a", "name": "MX Keys Mini" },
  { "id": "b04d0d28-eb8e-4d04-bb43-7cb7e0feddc6", "name": "MX Keys S" },
  { "id": "1d2411a7-fd35-42ae-be8c-5c584c718f72", "name": "MX Mechanical" },
  { "id": "f8686501-a873-431c-8e32-ad0fa7135324", "name": "MX Keys Mini" },
  { "id": "ea0a5af7-0c56-48ca-b659-e9a28ad890d8", "name": "MX Keys Mini" }
];

async function main() {
    let results = [];
    for (const p of products) {
        let img = await searchLogitechImage(p.name);
        if (img) {
            img = decodeURIComponent(img);
            if (img.includes('//')) {
               const cleanMatch = img.match(/https:\/\/resource\.logitech\.com\/[^\&]+/);
               if(cleanMatch) {
                    // normalize it to higher quality if possible
                    let finalUrl = cleanMatch[0].replace('w_200', 'w_800').replace('w_300', 'w_800').replace('w_400', 'w_800');
                    console.log(`Found for ${p.name}: ${finalUrl}`);
                    results.push(`UPDATE public.products SET images = ARRAY['${finalUrl}'] WHERE id = '${p.id}';`);
               }
            }
        } else {
            console.log(`No image found for ${p.name}`);
        }
        await new Promise(r => setTimeout(r, 1500));
    }
    fs.writeFileSync('update_queries.sql', results.join('\n'));
    console.log('Done.');
}
main();
