'use strict';

document.addEventListener('DOMContentLoaded', function () {
    const locations = {
        'california': {
            address: '3050 West 7th St, Los Angeles,<br>California 90005, USA',
            phone: '+1 (213) 555-0199',
            mapImg: 'https://maps.google.com/maps?q=3050%20West%207th%20St,%20Los%20Angeles,%20California&t=&z=13&ie=UTF8&iwloc=&output=embed'
        },
        'delaware': {
            address: '30 commercial road Fratton,<br>Delaware 19801, USA',
            phone: '+ (123-687-910-555)',
            mapImg: 'https://maps.google.com/maps?q=30%20commercial%20road%20Fratton,%20Delaware&t=&z=13&ie=UTF8&iwloc=&output=embed'
        },
        'missouri': {
            address: '1200 Market St, St. Louis,<br>Missouri 63103, USA',
            phone: '+1 (314) 555-0144',
            mapImg: 'https://maps.google.com/maps?q=1200%20Market%20St,%20St.%20Louis,%20Missouri&t=&z=13&ie=UTF8&iwloc=&output=embed'
        },
        'nc': {
            address: '400 S Tryon St, Charlotte,<br>North Carolina 28202, USA',
            phone: '+1 (704) 555-0177',
            mapImg: 'https://maps.google.com/maps?q=400%20S%20Tryon%20St,%20Charlotte,%20North%20Carolina&t=&z=13&ie=UTF8&iwloc=&output=embed'
        }
    };

    const tabButtons = document.querySelectorAll('.location2__tab-item');
    const addressEl = document.getElementById('location2-address');
    const phoneEl = document.getElementById('location2-phone');
    let mapImgEl = document.getElementById('location2-map-img');
    const mapWrapper = document.getElementById('location2-map-wrapper');

    // Early exit if essential elements are missing
    if (!tabButtons.length || !mapImgEl || !mapWrapper) return;

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            const locationKey = this.getAttribute('data-location');
            const data = locations[locationKey];

            if (!data) return;

            // Update Active State
            tabButtons.forEach(btn => btn.classList.remove('location2__tab-item--active'));
            this.classList.add('location2__tab-item--active');

            // Apply Fade Out Effect
            mapWrapper.style.opacity = '0.3';
            mapWrapper.style.transition = 'opacity 0.3s ease';

            setTimeout(() => {
                // Update Content
                if (addressEl) addressEl.innerHTML = data.address;
                if (phoneEl) {
                    phoneEl.innerText = data.phone;
                    phoneEl.setAttribute('href', `tel:${data.phone.replace(/[^0-9+]/g, '')}`);
                }
                
                // Update Image or Map
                let mapSrc = data.mapImg;
                let isIframeSrc = false;
                
                // Extract src if user pasted full iframe tag
                if (mapSrc.trim().startsWith('<iframe')) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = mapSrc;
                    const iframe = tempDiv.querySelector('iframe');
                    if (iframe && iframe.src) {
                        mapSrc = iframe.src;
                        isIframeSrc = true;
                    }
                }

                // Check if the source is a map link or an iframe embed
                const isMapLink = mapSrc.includes('google.com/maps') || mapSrc.includes('maps.google.com') || isIframeSrc;

                if (isMapLink) {
                    // If it's a map link, ensure the element is an iframe
                    if (mapImgEl.tagName.toLowerCase() !== 'iframe') {
                        const newIframe = document.createElement('iframe');
                        newIframe.id = 'location2-map-img';
                        newIframe.className = mapImgEl.className;
                        newIframe.src = mapSrc;
                        newIframe.setAttribute('allowfullscreen', '');
                        newIframe.setAttribute('loading', 'lazy');
                        newIframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
                        mapImgEl.replaceWith(newIframe);
                        mapImgEl = newIframe; // Update reference
                    } else {
                        mapImgEl.setAttribute('src', mapSrc);
                    }
                } else {
                    // If it's an image link, ensure the element is an img
                    if (mapImgEl.tagName.toLowerCase() !== 'img') {
                        const newImg = document.createElement('img');
                        newImg.id = 'location2-map-img';
                        newImg.className = mapImgEl.className;
                        newImg.src = mapSrc;
                        newImg.alt = "Course Locations Map";
                        mapImgEl.replaceWith(newImg);
                        mapImgEl = newImg; // Update reference
                    } else {
                        mapImgEl.setAttribute('src', mapSrc);
                    }
                }

                // Fade In Effect
                mapWrapper.style.opacity = '1';
            }, 300);
        });
    });
});

