# Scene Photo Regeneration Brief

Purpose: regenerate every C1-C40 scene backdrop as a photorealistic Japanese travel conversation background with a soft pastel grade.

Use for all images:
- Aspect: 16:10 or wider, safe center crop for mobile hero.
- Style: realistic photo / cinematic travel still, soft pastel color grading, gentle daylight or warm indoor light.
- People: include Japanese staff and traveler/customer in a natural conversation moment. Faces may be slightly side-facing or background-soft, but the situation must clearly show two people interacting.
- UI safety: leave a darker/less busy lower third or side area for white overlay text.
- Avoid: illustration, anime, 3D render, flat vector, Chinese motifs, empty interiors, text gibberish, brand logos, readable real brand signs, overly saturated neon.
- Camera: 35mm editorial travel photography, shallow but usable depth of field.
- Output path: keep the existing filenames under `public/scenes/generated/`.

Prompt template:

```text
Photorealistic Japanese travel conversation scene for a mobile language learning app.
Scene: <SCENE>.
Show <STAFF> and a Korean adult traveler/customer having a natural short conversation.
Soft pastel color grading, realistic Japanese location details, gentle ambient light, clean modern composition.
Leave lower third slightly darker and uncluttered for UI text overlay.
No logos, no readable brand names, no illustration, no anime, no 3D render, no Chinese-style decor.
```

## C1-C40 Prompts

| id | file | scene prompt |
|---|---|---|
| C1 | `c1-conbini-bg.webp` | Japanese convenience store cashier counter, staff asking a customer about bag, chopsticks, payment. |
| C2 | `c2-restaurant-bg.webp` | Casual Japanese restaurant table, server taking an order from a traveler, menu visible but no readable brand text. |
| C3 | `c3-train-bg.webp` | Japanese train station platform or ticket gate, station staff helping a traveler check platform and destination. |
| C4 | `c4-hotel-bg.webp` | Japanese hotel front desk, receptionist speaking with traveler during check-in. |
| C5 | `c5-street-bg.webp` | Japanese street corner, local person or staff giving directions to traveler near a map board. |
| C6 | `c6-pharmacy-bg.webp` | Japanese pharmacy counter, pharmacist listening to traveler describe symptoms. |
| C7 | `c7-shopping-bg.webp` | Japanese boutique shop, staff helping traveler with size, color, and fitting. |
| C8 | `c8-taxi-bg.webp` | Taxi stand or taxi interior, Japanese driver confirming destination with traveler. |
| C9 | `c9-airport-bg.webp` | Airport immigration or arrival counter, officer/staff speaking with traveler. |
| C10 | `c10-exchange-bg.webp` | Currency exchange counter in Japan, staff exchanging Korean won to yen for traveler. |
| C11 | `c11-locker-bg.webp` | Japanese station coin locker area, traveler asking staff or local helper how to use locker. |
| C12 | `c12-delivery-bg.webp` | Japanese parcel delivery or convenience store shipping counter, staff helping traveler send luggage. |
| C13 | `c13-ramen-bg.webp` | Ramen shop counter, staff confirming order and noodle firmness with traveler. |
| C14 | `c14-cafe-bg.webp` | Japanese cafe counter, barista asking dine-in or takeaway and drink size. |
| C15 | `c15-bakery-bg.webp` | Japanese bakery display case, staff asking which bread and whether bag is needed. |
| C16 | `c16-izakaya-bg.webp` | Warm izakaya table or entrance, staff confirming reservation and first drink. |
| C17 | `c17-sushi-bg.webp` | Sushi restaurant counter, chef or staff taking sushi order from traveler. |
| C18 | `c18-tourist-info-bg.webp` | Tourist information desk, staff explaining route or local recommendation to traveler. |
| C19 | `c19-shrine-bg.webp` | Shrine grounds with etiquette sign, attendant or local explaining photo/visit etiquette. |
| C20 | `c20-onsen-bg.webp` | Onsen reception or changing area entrance, staff explaining towel or bath rules, no nudity. |
| C21 | `c21-ryokan-bg.webp` | Ryokan tatami lobby, staff explaining dinner time or bath location to traveler. |
| C22 | `c22-bus-bg.webp` | Japanese bus stop or bus interior, driver/staff confirming fare or destination. |
| C23 | `c23-shinkansen-bg.webp` | Shinkansen ticket gate or platform, station staff helping with reserved seat. |
| C24 | `c24-rental-car-bg.webp` | Rental car desk, staff explaining insurance or navigation to traveler. |
| C25 | `c25-hospital-bg.webp` | Clinic reception, staff asking symptoms or insurance details. |
| C26 | `c26-police-bg.webp` | Koban police box, officer helping traveler report lost item. |
| C27 | `c27-emergency-bg.webp` | Emergency help desk or station office, staff calmly assisting traveler in trouble. |
| C28 | `c28-telecom-bg.webp` | Mobile phone shop, staff explaining SIM/eSIM or Wi-Fi plan to traveler. |
| C29 | `c29-laundromat-bg.webp` | Coin laundry, staff/local helping traveler understand machine controls. |
| C30 | `c30-festival-bg.webp` | Japanese festival food stall, vendor speaking with traveler ordering food. |
| C31 | `c31-kaiten-sushi-bg.webp` | Conveyor belt sushi restaurant, staff explaining touch panel and plates. |
| C32 | `c32-fashion-fitting-bg.webp` | Fashion select shop fitting room area, staff guiding traveler to try clothes. |
| C33 | `c33-hotel-umbrella-bg.webp` | Hotel lobby on rainy day, traveler asking receptionist to borrow umbrella. |
| C34 | `c34-hotel-room-change-bg.webp` | Hotel front desk, traveler politely asking staff to change room due to smell or bed type. |
| C35 | `c35-narita-ticket-bg.webp` | Narita airport station ticket office, staff helping exchange open ticket for real train ticket. |
| C36 | `c36-airport-baggage-bg.webp` | Airport check-in counter, staff explaining overweight baggage while traveler reorganizes luggage. |
| C37 | `c37-breakfast-buffet-bg.webp` | Hotel breakfast buffet, traveler asking staff to refill empty food tray. |
| C38 | `c38-sushi-extra-bg.webp` | Sushi restaurant, traveler asking staff for another beer or extra sushi item. |
| C39 | `c39-pasta-options-bg.webp` | Pasta restaurant, staff explaining menu options and add-ons to traveler. |
| C40 | `c40-fashion-checkout-bg.webp` | Fashion shop checkout, staff explaining tax-free payment or receipt to traveler. |

Acceptance check:
- Every image contains at least one Japanese staff/local and one traveler/customer.
- It is clearly a conversation/service moment, not an empty scenery shot.
- It reads as Japan at a glance.
- Pastel is a color grade over realistic photography, not an illustration style.
