/* ==========================================================================
   KupaHanem Immersive 3D Interaction Logic - WebGL Three.js Edition
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- State Variables ---
    let cart = JSON.parse(localStorage.getItem('kupahanem_cart')) || [];
    let soundEnabled = false;
    let audioContext = null;
    let fireplaceNode = null; // Synthesized fireplace gain node

    // Orders list state
    const defaultOrders = [
        {
            id: 'KH-83749201-Y',
            date: '09.08.2026',
            time: '11:15',
            items: [
                {
                    id: 'toprak-hissiyati',
                    title: 'Toprak Hissiyatı',
                    price: 390,
                    qty: 1,
                    img: 'assets/nordic_forest.jpg',
                    meta: 'Doğal Seri - Zanaat Serisi'
                }
            ],
            total: 390,
            status: 'Tamamlandı'
        },
        {
            id: 'KH-49201847-B',
            date: '10.08.2026',
            time: '15:40',
            items: [
                {
                    id: 'custom-12345',
                    title: 'Özel Tasarım Kupa',
                    price: 400,
                    qty: 1,
                    img: 'assets/sade_beyaz.jpg',
                    meta: 'Sır: <strong>Bal Sarısı</strong> | Desen: <strong>Altın Yaldız</strong> | Kulp: <strong>Organik Meşe (Klasik C)</strong> | Kazıma: <strong>"YOLCULUK"</strong>'
                }
            ],
            total: 400,
            status: 'Fırınlanıyor'
        },
        {
            id: 'KH-92837492-X',
            date: '11.08.2026',
            time: '10:05',
            items: [
                {
                    id: 'karanlik-gunes',
                    title: 'Karanlık Güneş',
                    price: 450,
                    qty: 2,
                    img: 'assets/eclipse_matte.jpg',
                    meta: 'İmza Serisi - Zanaat Serisi'
                }
            ],
            total: 900,
            status: 'Hazırlanıyor'
        }
    ];

    let orders = JSON.parse(localStorage.getItem('kupahanem_orders')) || defaultOrders;
    if (!localStorage.getItem('kupahanem_orders')) {
        localStorage.setItem('kupahanem_orders', JSON.stringify(defaultOrders));
    }


    // Customizer state
    let customMug = {
        color: '#F4F1DE',
        colorName: 'Porselen Krem',
        pattern: 'none',
        patternName: 'Sade Mat',
        handle: 'ceramic',
        handleName: 'Bütünsel Kil',
        handleShape: 'classic',
        handleShapeName: 'Klasik C',
        clayTexture: 'glazed',
        clayTextureName: 'Cilalı Parlak Sır',
        studioLighting: 'daylight',
        studioLightingName: 'Gün Işığı Atölyesi',
        layers: [
            {
                id: 'layer-default-text',
                type: 'text',
                text: 'KUPAHANEM',
                font: 'Outfit',
                size: 45,
                x: 0,
                y: 690,
                color: 'auto',
                side: 'front'
            }
        ]
    };

    // Default catalog data if localStorage is empty
    const defaultCatalog = [
        {
            id: 'toprak-hissiyati',
            title: 'Toprak Hissiyatı',
            price: 390,
            image: 'assets/nordic_forest.jpg',
            desc: 'Mat adaçayı yeşili sırlı gövde ile el işçiliği ham ahşap kulp uyumu.',
            category: 'Doğal Seri',
            volume: '350ml',
            heat: '8/10'
        },
        {
            id: 'karanlik-gunes',
            title: 'Karanlık Güneş',
            price: 450,
            image: 'assets/eclipse_matte.jpg',
            desc: 'Mat siyah killi doku üzerinde narin altın ağızlık kaplaması.',
            category: 'İmza Serisi',
            volume: '320ml',
            heat: '9/10'
        },
        {
            id: 'kozmik-gezgin',
            title: 'Kozmik Gezgin',
            price: 380,
            image: 'assets/kozmik_gezgin.jpg',
            desc: 'Lacivert sırı üzerine ince altın beneklerle işlenmiş yıldızlı gökyüzü.',
            category: 'Gece Serisi',
            volume: '400ml',
            heat: '7/10'
        },
        {
            id: 'siber-hanem',
            title: 'Siber Hanem',
            price: 420,
            image: 'assets/siber_hanem.jpg',
            desc: 'Mat antrasit seramik üzerine minimalist siber çizgiler çizen sırlama.',
            category: 'Endüstriyel Seri',
            volume: '350ml',
            heat: '8/10'
        }
    ];

    let catalog = JSON.parse(localStorage.getItem('kupahanem_catalog')) || defaultCatalog;
    if (!localStorage.getItem('kupahanem_catalog')) {
        localStorage.setItem('kupahanem_catalog', JSON.stringify(defaultCatalog));
    }

    function getProductById(id) {
        return catalog.find(p => p.id === id);
    }

    // --- DOM Elements ---
    const body = document.body;
    const entryPortal = document.getElementById('entry-portal');
    const enterBtn = document.getElementById('enter-btn');
    const mainHeader = document.querySelector('.main-header');
    const mainContent = document.querySelector('.main-content');
    const mainFooter = document.querySelector('.main-footer');
    
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const cartBadge = document.getElementById('cart-badge');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartItemsWrapper = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Customizer Controls
    const colorSelectors = document.getElementById('color-selectors');
    const selectedColorLabel = document.getElementById('selected-color-name');
    const patternSelectors = document.getElementById('pattern-selectors');
    const handleSelectors = document.getElementById('handle-selectors');
    const handleShapeSelectors = document.getElementById('handle-shape-selectors');
    const customTotalPrice = document.getElementById('custom-total-price');
    const addCustomCartBtn = document.getElementById('add-custom-cart-btn');

    // Upgraded Customizer Controls
    const customizerTabBtns = document.querySelectorAll('.customizer-tab-btn');
    const customizerTabContents = document.querySelectorAll('.customizer-tab-content');
    const clayTextureSelectors = document.getElementById('clay-texture-selectors');
    const studioLightingSelectors = document.getElementById('studio-lighting-selectors');
    const presetBadgeBtns = document.querySelectorAll('.preset-badge-btn');

    // Layer Personalization Elements
    const addTextLayerBtn = document.getElementById('add-text-layer-btn');
    const addPhotoLayerBtn = document.getElementById('add-photo-layer-btn');
    const customLayersList = document.getElementById('custom-layers-list');
    const layerEditPanel = document.getElementById('layer-edit-panel');
    const editLayerTitle = document.getElementById('edit-layer-title');
    const deleteLayerBtn = document.getElementById('delete-layer-btn');
    const layerSideFrontBtn = document.getElementById('layer-side-front-btn');
    const layerSideBackBtn = document.getElementById('layer-side-back-btn');
    const layerPosY = document.getElementById('layer-pos-y');
    const layerPosX = document.getElementById('layer-pos-x');

    const layerTextSettings = document.getElementById('layer-text-settings');
    const layerTextInput = document.getElementById('layer-text-input');
    const layerTextFontSelect = document.getElementById('layer-text-font-select');
    const layerTextSize = document.getElementById('layer-text-size');
    const layerTextColorSelectors = document.getElementById('layer-text-color-selectors');

    const layerPhotoSettings = document.getElementById('layer-photo-settings');
    const layerPhotoPreview = document.getElementById('layer-photo-preview');
    const layerChangePhotoBtn = document.getElementById('layer-change-photo-btn');
    const layerPhotoFileInput = document.getElementById('layer-photo-file-input');
    const layerPhotoScale = document.getElementById('layer-photo-scale');

    let activeLayerId = 'layer-default-text';

    // Admin Panel Elements
    const adminLoginTrigger = document.getElementById('admin-login-trigger');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const adminLoginClose = document.getElementById('admin-login-close');
    const adminPassInput = document.getElementById('admin-pass-input');
    const adminLoginError = document.getElementById('admin-login-error');
    const adminLoginSubmit = document.getElementById('admin-login-submit');

    const adminDashboardModal = document.getElementById('admin-dashboard-modal');
    const adminDashboardClose = document.getElementById('admin-dashboard-close');
    const adminProductList = document.getElementById('admin-product-list');
    const addProductForm = document.getElementById('add-product-form');

    const newProdTitle = document.getElementById('new-prod-title');
    const newProdPrice = document.getElementById('new-prod-price');
    const newProdCategory = document.getElementById('new-prod-category');
    const newProdDesc = document.getElementById('new-prod-desc');
    const newProdVolume = document.getElementById('new-prod-volume');
    const newProdHeat = document.getElementById('new-prod-heat');
    const newProdImage = document.getElementById('new-prod-image');
    const newProdImageFile = document.getElementById('new-prod-image-file');
    const customUploadBtn = document.getElementById('custom-upload-btn');
    const uploadPreviewContainer = document.getElementById('upload-preview-container');
    const uploadPreviewImg = document.getElementById('upload-preview-img');
    const uploadFileName = document.getElementById('upload-file-name');
    const cancelUploadBtn = document.getElementById('cancel-upload-btn');

    let uploadedImageBase64 = '';

    // Upgraded Admin Dashboard Elements
    const adminOrdersBadge = document.getElementById('admin-orders-badge');
    const statRevenue = document.getElementById('stat-revenue');
    const statOrders = document.getElementById('stat-orders');
    const statAvgValue = document.getElementById('stat-avg-value');
    const statProducts = document.getElementById('stat-products');
    const statCustomPercent = document.getElementById('stat-custom-percent');
    const statCustomBar = document.getElementById('stat-custom-bar');
    const statCatalogPercent = document.getElementById('stat-catalog-percent');
    const statCatalogBar = document.getElementById('stat-catalog-bar');

    
    // Product Edit elements
    const editProdId = document.getElementById('edit-prod-id');
    const catalogFormTitle = document.getElementById('catalog-form-title');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const submitProdBtnText = document.getElementById('submit-prod-btn-text');
    const submitProdBtnIcon = document.getElementById('submit-prod-btn-icon');
    
    // Orders Tab elements
    const adminOrdersListBody = document.getElementById('admin-orders-list-body');
    const adminOrderDetailPanel = document.getElementById('admin-order-detail-panel');
    const detailOrderTitle = document.getElementById('detail-order-title');
    const detailOrderContent = document.getElementById('detail-order-content');
    const closeOrderDetailBtn = document.getElementById('close-order-detail-btn');
    


    // Quiz Elements
    const quizBox = document.getElementById('quiz-box');
    const quizProgress = document.getElementById('quiz-progress');
    const quizSlides = document.querySelectorAll('.quiz-slide');
    const quizResultSlide = document.getElementById('quiz-result-slide');
    const recommendedMugTitle = document.getElementById('recommended-mug-title');
    const recommendedMugImg = document.getElementById('recommended-mug-img');
    const recommendedMugDesc = document.getElementById('recommended-mug-desc');
    const addRecommendedToCartBtn = document.getElementById('add-recommended-to-cart');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');

    // Checkout Elements
    const checkoutModal = document.getElementById('checkout-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const completeOrderBtn = document.getElementById('complete-order-btn');
    const printTicketBtn = document.getElementById('print-ticket-btn');
    const ticketIdElement = document.getElementById('ticket-id');
    const ticketDateElement = document.getElementById('ticket-date');
    const ticketItemsWrapper = document.getElementById('ticket-items');
    const ticketTotalElement = document.getElementById('ticket-total');

    // Certificate Elements
    const certificateModal = document.getElementById('certificate-modal');
    const certModalCloseBtn = document.getElementById('cert-modal-close-btn');
    const certSerialNumber = document.getElementById('cert-serial-number');
    const certSpecsList = document.getElementById('cert-specs-list');
    const printCertBtn = document.getElementById('print-cert-btn');
    const closeCertModalBtn = document.getElementById('close-cert-modal-btn');

    // Ambient Dashboard
    const ambientDashboard = document.getElementById('ambient-dashboard');
    const ambientDbClose = document.getElementById('ambient-db-close');
    const fireVolumeSlider = document.getElementById('fire-volume');
    const cafeVolumeSlider = document.getElementById('cafe-volume');

    // --- Three.js WebGL Scene Initialization ---
    let scene, camera, renderer, controls;
    let ambientLight, dirLight, specLight;
    let mugGroup, mugBodyMesh, mugHandleMesh;
    let textureCanvas, textureContext, canvasTexture;
    let threejsContainer = document.getElementById('threejs-container');

    // --- Shop & Admin Catalog Rendering ---
    const shopGalleryGrid = document.getElementById('shop-gallery-grid');
    
    function renderShopCatalog() {
        if (!shopGalleryGrid) return;
        
        if (catalog.length === 0) {
            shopGalleryGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: var(--color-text-muted); padding: 3rem;">
                    <i class="fa-solid fa-cookie-bite" style="font-size: 3rem; margin-bottom: 1.5rem; opacity: 0.1;"></i>
                    <p>Atölyemizde şu an hazır ürün kalmadı. Yönetici girişi ile yeni ürünler ekleyebilirsiniz!</p>
                </div>
            `;
            return;
        }

        shopGalleryGrid.innerHTML = catalog.map(p => `
            <div class="mug-card" data-id="${p.id}">
                <div class="product-img-wrapper">
                    <img src="${p.image}" alt="${p.title}" class="product-img">
                    <div class="card-hover-actions">
                        <button class="card-btn add-to-cart-quick" title="Sepete Hızlı Ekle">
                            <i class="fa-solid fa-cart-plus"></i>
                        </button>
                        <button class="card-btn customize-product-btn" title="Atölyede Düzenle">
                            <i class="fa-solid fa-compass-drafting"></i>
                        </button>
                    </div>
                </div>
                <div class="card-info">
                    <span class="product-category">${p.category}</span>
                    <h3 class="product-title">${p.title}</h3>
                    <p class="product-desc">${p.desc}</p>
                    <div class="product-specs">
                        <span><i class="fa-solid fa-whiskey-glass"></i> ${p.volume}</span>
                        <span><i class="fa-solid fa-temperature-half"></i> Isı Koruma: ${p.heat}</span>
                    </div>
                    <div class="card-footer">
                        <span class="product-price">${p.price} TL</span>
                        <button class="add-cart-text-btn add-cart-text-action">Sepete Ekle</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderAdminCatalog() {
        if (!adminProductList) return;
        
        if (catalog.length === 0) {
            adminProductList.innerHTML = `<p style="text-align: center; color: var(--color-text-muted); padding: 1.5rem; grid-column: 1 / -1;">Katalogta aktif ürün bulunmuyor.</p>`;
            return;
        }

        adminProductList.innerHTML = catalog.map(p => `
            <div class="admin-prod-card">
                <img src="${p.image}" alt="${p.title}" class="admin-prod-thumbnail">
                <div class="admin-prod-info">
                    <span class="admin-prod-name">${p.title}</span>
                    <span class="admin-prod-price">${p.price} TL</span>
                </div>
                <button class="admin-prod-delete-btn" data-delete-id="${p.id}" title="Ürünü Sil">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `).join('');
    }

    function init3DStage() {
        if (scene) return; // Prevent double init

        const width = threejsContainer.clientWidth || 320;
        const height = threejsContainer.clientHeight || 380;

        // 1. Create Scene & Camera
        scene = new THREE.Scene();
        
        camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.position.set(0, 1.8, 4.5); // Cinematic framing angle

        // 2. WebGL Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        threejsContainer.appendChild(renderer.domElement);

        // 3. Orbit Controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 3.0;
        controls.maxDistance = 6.0;
        controls.maxPolarAngle = Math.PI / 2 + 0.1; // Limit looking fully under bottom
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.8;

        // 4. Lights
        ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        dirLight = new THREE.DirectionalLight(0xfffbf0, 0.8); // Warm studio sunlight
        dirLight.position.set(6, 12, 6);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        scene.add(dirLight);

        specLight = new THREE.PointLight(0xffffff, 0.6, 20); // Point light for sharp porcelain highlights
        specLight.position.set(-6, 3, -6);
        scene.add(specLight);

        // 5. Offscreen Canvas for texture drawing
        textureCanvas = document.createElement('canvas');
        textureCanvas.width = 1024;
        textureCanvas.height = 1024;
        textureContext = textureCanvas.getContext('2d');
        
        canvasTexture = new THREE.CanvasTexture(textureCanvas);
        canvasTexture.wrapS = THREE.RepeatWrapping;
        canvasTexture.wrapT = THREE.ClampToEdgeWrapping;
        canvasTexture.minFilter = THREE.LinearMipmapLinearFilter;

        // 6. Build the Mug Group
        mugGroup = new THREE.Group();
        buildMugMesh();
        scene.add(mugGroup);

        // Center group slightly down
        mugGroup.position.y = -1.1;

        // Shadow catcher floor underneath the mug base
        const floorGeo = new THREE.PlaneGeometry(15, 15);
        const floorMat = new THREE.ShadowMaterial({ opacity: 0.18 });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.y = -1.105;
        floorMesh.receiveShadow = true;
        scene.add(floorMesh);

        // 7. Render Loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Slow down auto-rotation if user interacts
            if (controls) {
                controls.update();
            }

            renderer.render(scene, camera);
        }
        
        // Initial drawing
        updateMugTexture();
        animate();

        // Register container drag/hover listener to pause autoRotate
        threejsContainer.addEventListener('mousedown', () => {
            controls.autoRotate = false;
        });
        threejsContainer.addEventListener('touchstart', () => {
            controls.autoRotate = false;
        });
    }

    // Mathematical modeling of a hollow mug silhouette using LatheGeometry
    function buildMugMesh() {
        const points = [];
        // Subdivided profile coordinates to ensure linear V mapping in LatheGeometry (prevents vertical texture stretching)
        
        // 1. Bottom Base (from center to outer corner, length 1.05)
        for (let i = 0; i <= 4; i++) {
            const t = i / 4;
            points.push(new THREE.Vector2(1.05 * t, 0));
        }
        
        // 2. Corner Curve (from 1.05, 0 to 1.1, 0.05)
        points.push(new THREE.Vector2(1.1, 0.05));
        
        // 3. Outer Wall (from 1.1, 0.05 to 1.1, 2.3, length 2.25)
        for (let i = 1; i <= 10; i++) {
            const t = i / 10;
            points.push(new THREE.Vector2(1.1, 0.05 + 2.25 * t));
        }
        
        // 4. Lip Curve (from 1.1, 2.3 to 0.97, 2.3)
        points.push(new THREE.Vector2(1.08, 2.4));
        points.push(new THREE.Vector2(1.04, 2.42));
        points.push(new THREE.Vector2(1.0, 2.4));
        points.push(new THREE.Vector2(0.97, 2.3));
        
        // 5. Inner Wall (from 0.97, 2.3 to 0.97, 0.15, length 2.15)
        for (let i = 1; i <= 10; i++) {
            const t = i / 10;
            points.push(new THREE.Vector2(0.97, 2.3 - 2.15 * t));
        }
        
        // 6. Inside Bottom (from 0.97, 0.15 to 0, 0.15, length 0.97)
        for (let i = 1; i <= 4; i++) {
            const t = i / 4;
            points.push(new THREE.Vector2(0.97 * (1 - t), 0.15));
        }

        const cupGeometry = new THREE.LatheGeometry(points, 64);
        
        // Physical glazed ceramic material
        const cupMaterial = new THREE.MeshPhysicalMaterial({
            map: canvasTexture,
            roughness: 0.15,
            metalness: 0.05,
            clearcoat: 1.0,
            clearcoatRoughness: 0.06,
            side: THREE.DoubleSide
        });

        mugBodyMesh = new THREE.Mesh(cupGeometry, cupMaterial);
        mugBodyMesh.castShadow = true;
        mugBodyMesh.receiveShadow = true;
        mugGroup.add(mugBodyMesh);

        // Build Handle
        rebuildMugHandle();
    }

    function rebuildMugHandle() {
        if (mugHandleMesh) {
            mugGroup.remove(mugHandleMesh);
            mugHandleMesh = null;
        }

        const handleType = customMug.handle;
        const handleShape = customMug.handleShape;

        if (handleShape !== 'none') {
            let handleGeometry;
            const handleMaterial = getHandleMaterial();

            if (handleShape === 'classic') {
                handleGeometry = new THREE.TorusGeometry(0.68, 0.12, 16, 64, Math.PI * 1.1);
                mugHandleMesh = new THREE.Mesh(handleGeometry, handleMaterial);
                mugHandleMesh.position.set(-0.95, 1.2, 0);
                mugHandleMesh.rotation.z = Math.PI / 1.8;
            } 
            else if (handleShape === 'ring-o') {
                handleGeometry = new THREE.TorusGeometry(0.52, 0.12, 16, 64, Math.PI * 2);
                mugHandleMesh = new THREE.Mesh(handleGeometry, handleMaterial);
                mugHandleMesh.position.set(-1.45, 1.2, 0);
            } 
            else if (handleShape === 'angular-d') {
                // Extrusion shape for premium D-handle
                const shape = new THREE.Shape();
                shape.moveTo(-0.1, -0.6);
                shape.lineTo(-0.55, -0.6);
                shape.quadraticCurveTo(-0.85, -0.5, -0.85, -0.25);
                shape.lineTo(-0.85, 0.25);
                shape.quadraticCurveTo(-0.85, 0.5, -0.55, 0.6);
                shape.lineTo(-0.1, 0.6);

                const hole = new THREE.Path();
                hole.moveTo(-0.1, -0.42);
                hole.lineTo(-0.4, -0.42);
                hole.quadraticCurveTo(-0.62, -0.35, -0.62, -0.15);
                hole.lineTo(-0.62, 0.15);
                hole.quadraticCurveTo(-0.62, 0.35, -0.4, 0.42);
                hole.lineTo(-0.1, 0.42);
                shape.holes.push(hole);

                const extrudeSettings = {
                    depth: 0.22,
                    bevelEnabled: true,
                    bevelSegments: 4,
                    steps: 1,
                    bevelSize: 0.03,
                    bevelThickness: 0.03
                };
                handleGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                
                mugHandleMesh = new THREE.Mesh(handleGeometry, handleMaterial);
                mugHandleMesh.position.set(-1.0, 1.2, -0.11);
            }

            if (mugHandleMesh) {
                mugHandleMesh.castShadow = true;
                mugHandleMesh.receiveShadow = true;
                mugGroup.add(mugHandleMesh);
            }
        }
    }

    function getHandleMaterial() {
        const handleType = customMug.handle;
        const isBlueprint = customMug.studioLighting === 'blueprint';
        let mat;

        if (handleType === 'ceramic') {
            let roughnessVal = 0.15;
            let clearcoatVal = 1.0;

            if (customMug.clayTexture === 'rough') {
                roughnessVal = 0.85;
                clearcoatVal = 0.0;
            } else if (customMug.clayTexture === 'matte') {
                roughnessVal = 0.55;
                clearcoatVal = 0.1;
            }

            mat = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(customMug.color),
                roughness: roughnessVal,
                clearcoat: clearcoatVal,
                clearcoatRoughness: 0.06,
                wireframe: isBlueprint
            });
        } 
        else if (handleType === 'wood') {
            mat = new THREE.MeshStandardMaterial({
                color: 0xA67A4E,
                roughness: 0.72,
                metalness: 0.0,
                wireframe: isBlueprint
            });
        } 
        else if (handleType === 'gold') {
            mat = new THREE.MeshStandardMaterial({
                color: 0xD4AF37,
                roughness: 0.1,
                metalness: 0.96,
                wireframe: isBlueprint
            });
        } 
        else if (handleType === 'brass') {
            mat = new THREE.MeshStandardMaterial({
                color: 0x997A42,
                roughness: 0.35,
                metalness: 0.85,
                wireframe: isBlueprint
            });
        }
        return mat;
    }

    // Dynamic 2D offscreen rendering updates ThreeJS Texture
    function updateMugTexture() {
        if (!textureContext) return;

        const ctx = textureContext;
        const w = textureCanvas.width;
        const h = textureCanvas.height;

        // 1. Draw Glaze Base color
        ctx.fillStyle = customMug.color;
        ctx.fillRect(0, 0, w, h);

        // 2. Draw Artistic Patterns (Confining to the outer wall coordinate range Y=512 to Y=870)
        const pattern = customMug.pattern;
        
        if (pattern === 'speckles') {
            ctx.fillStyle = isColorDark(customMug.color) ? 'rgba(255,255,255,0.22)' : 'rgba(90, 78, 70, 0.7)';
            // Bold speckled clay drops
            const dots = [
                {x: 100, y: 560, r: 18}, {x: 250, y: 680, r: 14}, {x: 450, y: 800, r: 22},
                {x: 600, y: 580, r: 16}, {x: 800, y: 700, r: 12}, {x: 950, y: 780, r: 24},
                {x: 150, y: 780, r: 15}, {x: 380, y: 580, r: 20}, {x: 520, y: 720, r: 14},
                {x: 700, y: 810, r: 22}, {x: 880, y: 560, r: 16}, {x: 320, y: 820, r: 12},
                {x: 720, y: 650, r: 18}, {x: 900, y: 790, r: 15}, {x: 50, y: 700, r: 22}
            ];
            dots.forEach(d => {
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fill();
                // Wrap texture duplicates
                ctx.beginPath();
                ctx.arc(d.x + w/2, d.y, d.r, 0, Math.PI * 2);
                ctx.fill();
            });
        } 
        else if (pattern === 'waves') {
            // High visibility glaze wave loops
            ctx.strokeStyle = isColorDark(customMug.color) ? 'rgba(255,255,255,0.45)' : 'rgba(224, 122, 95, 0.85)';
            ctx.lineWidth = 32;
            for (let y = 560; y <= 800; y += 110) {
                ctx.beginPath();
                for (let x = 0; x <= w; x += 10) {
                    const waveY = y + Math.sin((x / w) * Math.PI * 4) * 25;
                    if (x === 0) ctx.moveTo(x, waveY);
                    else ctx.lineTo(x, waveY);
                }
                ctx.stroke();
            }
        } 
        else if (pattern === 'gold-glint') {
            // Golden stars & glints - scaled up
            ctx.fillStyle = '#D4AF37';
            ctx.strokeStyle = '#D4AF37';
            const stars = [
                {x: 120, y: 580}, {x: 320, y: 720}, {x: 580, y: 560}, {x: 720, y: 800}, {x: 880, y: 620},
                {x: 220, y: 800}, {x: 480, y: 640}, {x: 620, y: 760}, {x: 820, y: 560}, {x: 140, y: 700}
            ];
            stars.forEach(s => {
                // Cross lines star
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.moveTo(s.x - 22, s.y); ctx.lineTo(s.x + 22, s.y);
                ctx.moveTo(s.x, s.y - 22); ctx.lineTo(s.x, s.y + 22);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(s.x + 25, s.y + 25, 8, 0, Math.PI * 2);
                ctx.fill();

                // Wrapping copies
                ctx.beginPath();
                ctx.moveTo(s.x + w/2 - 22, s.y); ctx.lineTo(s.x + w/2 + 22, s.y);
                ctx.moveTo(s.x + w/2, s.y - 22); ctx.lineTo(s.x + w/2, s.y + 22);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(s.x + w/2 + 25, s.y + 25, 8, 0, Math.PI * 2);
                ctx.fill();
            });
        } 
        else if (pattern === 'stripes') {
            // Bold stripes wrapping
            ctx.strokeStyle = isColorDark(customMug.color) ? 'rgba(255,255,255,0.22)' : 'rgba(45, 31, 26, 0.35)';
            ctx.lineWidth = 20;
            for (let x = 0; x <= w; x += 128) {
                ctx.beginPath();
                ctx.moveTo(x, 500);
                ctx.lineTo(x, 860);
                ctx.stroke();
            }
        }

        // 2b. Draw Personalization Layers (Text / Photo)
        if (customMug.layers && customMug.layers.length > 0) {
            customMug.layers.forEach(layer => {
                const centerX = (layer.side === 'back') ? 768 : 256;
                const posX = centerX + layer.x;
                const posY = layer.y;

                if (layer.type === 'text' && layer.text) {
                    ctx.save();
                    
                    // Setup Font family and size
                    ctx.font = `700 ${layer.size}px "${layer.font}", sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // Color math
                    let textColorCode = layer.color;
                    if (textColorCode === 'auto') {
                        textColorCode = isColorDark(customMug.color) ? '#FFFFFF' : '#2D1F1A';
                    }
                    ctx.fillStyle = textColorCode;

                    // Draw text centered at posX, posY with wrapping
                    const drawTextWrapped = (t, x, y) => {
                        ctx.fillText(t, x, y);
                        ctx.fillText(t, x - 1024, y);
                        ctx.fillText(t, x + 1024, y);
                    };
                    drawTextWrapped(layer.text, posX, posY);
                    
                    ctx.restore();
                } 
                else if (layer.type === 'photo' && layer.imageElement) {
                    ctx.save();
                    
                    const img = layer.imageElement;
                    const aspect = img.naturalHeight / img.naturalWidth || 1;
                    const targetW = layer.scale;
                    const targetH = targetW * aspect;

                    const drawPhotoWrapped = (x, y) => {
                        ctx.drawImage(img, x - targetW / 2, y - targetH / 2, targetW, targetH);
                        ctx.drawImage(img, x - targetW / 2 - 1024, y - targetH / 2, targetW, targetH);
                        ctx.drawImage(img, x - targetW / 2 + 1024, y - targetH / 2, targetW, targetH);
                    };
                    drawPhotoWrapped(posX, posY);
                    
                    ctx.restore();
                }
            });
        }

        canvasTexture.needsUpdate = true;
    }

    // Handle updates when properties change
    function applyThreeChanges() {
        if (!scene) return;

        // Apply Clay Texture properties to body mesh material
        if (mugBodyMesh && mugBodyMesh.material) {
            const isBlueprint = customMug.studioLighting === 'blueprint';
            mugBodyMesh.material.wireframe = isBlueprint;

            if (customMug.clayTexture === 'rough') {
                mugBodyMesh.material.roughness = 0.85;
                mugBodyMesh.material.clearcoat = 0.0;
                mugBodyMesh.material.metalness = 0.15;
            } else if (customMug.clayTexture === 'matte') {
                mugBodyMesh.material.roughness = 0.55;
                mugBodyMesh.material.clearcoat = 0.1;
                mugBodyMesh.material.metalness = 0.05;
            } else { // 'glazed' (smooth / default)
                mugBodyMesh.material.roughness = 0.15;
                mugBodyMesh.material.clearcoat = 1.0;
                mugBodyMesh.material.clearcoatRoughness = 0.06;
                mugBodyMesh.material.metalness = 0.05;
            }
            mugBodyMesh.material.needsUpdate = true;
        }

        // Apply Studio Lighting Mode
        if (customMug.studioLighting === 'candlelight') {
            if (threejsContainer) {
                threejsContainer.style.background = 'radial-gradient(circle, #2C1F1A 0%, #120A07 100%)';
            }
            if (ambientLight) {
                ambientLight.color.setHex(0xe07a5f);
                ambientLight.intensity = 0.25;
            }
            if (dirLight) {
                dirLight.color.setHex(0xf39c12);
                dirLight.intensity = 1.3;
                dirLight.position.set(4, 8, 4);
            }
            if (specLight) {
                specLight.color.setHex(0xe07a5f);
                specLight.intensity = 0.4;
            }
        } else if (customMug.studioLighting === 'blueprint') {
            if (threejsContainer) {
                threejsContainer.style.background = 'radial-gradient(circle, #0F172A 0%, #020617 100%)';
            }
            if (ambientLight) {
                ambientLight.color.setHex(0x38BDF8);
                ambientLight.intensity = 0.8;
            }
            if (dirLight) {
                dirLight.color.setHex(0x38BDF8);
                dirLight.intensity = 0.5;
                dirLight.position.set(6, 12, 6);
            }
            if (specLight) {
                specLight.color.setHex(0x38BDF8);
                specLight.intensity = 0.2;
            }
        } else { // 'daylight' (default)
            if (threejsContainer) {
                threejsContainer.style.background = 'radial-gradient(circle, #FCFBF7 0%, #EFECE6 100%)';
            }
            if (ambientLight) {
                ambientLight.color.setHex(0xffffff);
                ambientLight.intensity = 0.7;
            }
            if (dirLight) {
                dirLight.color.setHex(0xfffbf0);
                dirLight.intensity = 0.8;
                dirLight.position.set(6, 12, 6);
            }
            if (specLight) {
                specLight.color.setHex(0xffffff);
                specLight.intensity = 0.6;
            }
        }
        
        // Remove and rebuild handle to match materials and shapes
        rebuildMugHandle();

        updateMugTexture();
    }

    // Auto resize 3D renderer on container bounds change
    window.addEventListener('resize', () => {
        if (!renderer || !camera || !threejsContainer) return;
        const width = threejsContainer.clientWidth;
        const height = threejsContainer.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });


    // --- Web Audio Synthesis (Ambiance & UI Sounds) ---
    function initAudio() {
        if (audioContext) return;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        setupFireplaceSynthesizer();
    }

    function setupFireplaceSynthesizer() {
        if (!audioContext) return;

        const bufferSize = audioContext.sampleRate * 2;
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.015 * white)) / 1.015;
            lastOut = output[i];
            output[i] *= 2.8;
        }

        const brownianNoiseNode = audioContext.createBufferSource();
        brownianNoiseNode.buffer = noiseBuffer;
        brownianNoiseNode.loop = true;

        const lowpassFilter = audioContext.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.setValueAtTime(180, audioContext.currentTime);

        fireplaceNode = audioContext.createGain();
        fireplaceNode.gain.setValueAtTime(0.04, audioContext.currentTime);

        brownianNoiseNode.connect(lowpassFilter);
        lowpassFilter.connect(fireplaceNode);
        fireplaceNode.connect(audioContext.destination);
        brownianNoiseNode.start(0);

        function spawnSpark() {
            if (!soundEnabled || !audioContext) return;

            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const bandpass = audioContext.createBiquadFilter();

            bandpass.type = 'bandpass';
            bandpass.frequency.value = 800 + Math.random() * 2000;
            bandpass.Q.value = 12;

            osc.type = 'triangle';
            osc.frequency.value = 40 + Math.random() * 100;

            gain.gain.setValueAtTime(0, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.06 * (fireVolumeSlider.value / 40), audioContext.currentTime + 0.001);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.03 + Math.random() * 0.03);

            osc.connect(bandpass);
            bandpass.connect(gain);
            gain.connect(audioContext.destination);

            osc.start();
            osc.stop(audioContext.currentTime + 0.08);

            setTimeout(spawnSpark, 150 + Math.random() * 1500);
        }

        spawnSpark();
    }

    function playSoundEffect(type) {
        if (!soundEnabled || !audioContext) return;

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(950, audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(250, audioContext.currentTime + 0.12);
            
            gain.gain.setValueAtTime(0.03, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start();
            osc.stop(audioContext.currentTime + 0.12);
        } 
        else if (type === 'success') {
            const notes = [440.00, 554.37, 659.25, 880.00];
            notes.forEach((freq, idx) => {
                const stepOsc = audioContext.createOscillator();
                const stepGain = audioContext.createGain();
                
                stepOsc.type = 'sine';
                stepOsc.frequency.setValueAtTime(freq, audioContext.currentTime + (idx * 0.05));
                
                stepGain.gain.setValueAtTime(0.04, audioContext.currentTime + (idx * 0.05));
                stepGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + (idx * 0.05) + 0.25);
                
                stepOsc.connect(stepGain);
                stepGain.connect(audioContext.destination);
                
                stepOsc.start(audioContext.currentTime + (idx * 0.05));
                stepOsc.stop(audioContext.currentTime + (idx * 0.05) + 0.3);
            });
        }
    }

    function toggleSound() {
        initAudio();
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            soundToggleBtn.classList.add('playing');
            audioContext.resume();
            if (fireplaceNode) fireplaceNode.gain.linearRampToValueAtTime(0.04 * (fireVolumeSlider.value / 100), audioContext.currentTime + 0.5);
            ambientDashboard.classList.remove('hidden');
        } else {
            soundToggleBtn.classList.remove('playing');
            if (fireplaceNode) fireplaceNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
            ambientDashboard.classList.add('hidden');
        }
    }

    soundToggleBtn.addEventListener('click', () => {
        toggleSound();
    });

    ambientDbClose.addEventListener('click', () => {
        ambientDashboard.classList.add('hidden');
    });

    fireVolumeSlider.addEventListener('input', (e) => {
        if (fireplaceNode && soundEnabled) {
            fireplaceNode.gain.setValueAtTime(0.08 * (e.target.value / 100), audioContext.currentTime);
        }
    });

    // --- Entry Portal ---
    enterBtn.addEventListener('click', () => {
        toggleSound(); 
        
        entryPortal.classList.add('fade-out');
        body.classList.remove('loading-state');

        // Instantly init 3D WebGL Canvas once bounds exist
        init3DStage();

        setTimeout(() => {
            mainHeader.classList.remove('hidden-element');
            mainHeader.classList.add('show-element');
            mainContent.classList.remove('hidden-element');
            mainContent.classList.add('show-element');
            mainFooter.classList.remove('hidden-element');
            mainFooter.classList.add('show-element');
        }, 300);
    });

    // Navigation links scroll
    document.querySelectorAll('.scroll-to').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            playSoundEffect('click');
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Scroll active link highlight
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSectionId = '';
        sections.forEach(sec => {
            const secTop = sec.offsetTop - 120;
            if (window.scrollY >= secTop) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // --- Customizer Interactive Logic ---
    function updateCustomizerPrice() {
        let basePrice = 290; 
        
        if (customMug.handle === 'wood') basePrice += 60;   
        if (customMug.handle === 'gold') basePrice += 100;  
        if (customMug.handle === 'brass') basePrice += 40;  
        
        if (customMug.pattern !== 'none') basePrice += 50;
        
        if (customMug.layers && customMug.layers.length > 0) {
            customMug.layers.forEach(layer => {
                if (layer.type === 'text') {
                    basePrice += 15;
                } else if (layer.type === 'photo') {
                    basePrice += 30;
                }
            });
        }

        customTotalPrice.textContent = `${basePrice} TL`;
    }

    // Customizer Sub-Tabs Switcher
    customizerTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playSoundEffect('click');
            const targetTab = btn.getAttribute('data-tab');

            customizerTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            customizerTabContents.forEach(content => {
                content.style.display = 'none';
            });

            const activeContent = document.getElementById(targetTab);
            if (activeContent) {
                activeContent.style.display = 'block';
            }
        });
    });

    // Clay Texture Selector
    if (clayTextureSelectors) {
        clayTextureSelectors.addEventListener('click', (e) => {
            const btn = e.target.closest('.handle-btn');
            if (!btn) return;
            playSoundEffect('click');

            clayTextureSelectors.querySelectorAll('.handle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            customMug.clayTexture = btn.getAttribute('data-clay-texture');
            customMug.clayTextureName = btn.getAttribute('data-clay-texture-name');

            applyThreeChanges();
        });
    }

    // Studio Lighting Selector
    if (studioLightingSelectors) {
        studioLightingSelectors.addEventListener('click', (e) => {
            const btn = e.target.closest('.handle-btn');
            if (!btn) return;
            playSoundEffect('click');

            studioLightingSelectors.querySelectorAll('.handle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            customMug.studioLighting = btn.getAttribute('data-lighting');
            customMug.studioLightingName = btn.getAttribute('data-lighting-name');

            applyThreeChanges();
        });
    }

    // Presets Loader (Zanaat Reçeteleri)
    presetBadgeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            playSoundEffect('success');
            const presetType = btn.getAttribute('data-preset');

            // Reset active preset button styling
            presetBadgeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (presetType === 'nordic') {
                customMug.color = '#81B29A'; // Adaçayı Yeşili
                customMug.colorName = 'Adaçayı Yeşili';
                customMug.pattern = 'waves'; // Killi Dalgalar
                customMug.patternName = 'Killi Dalgalar';
                customMug.handle = 'wood'; // Organik Meşe
                customMug.handleName = 'Organik Meşe';
                customMug.handleShape = 'classic';
                customMug.handleShapeName = 'Klasik C';
                customMug.clayTexture = 'matte';
                customMug.clayTextureName = 'Mat Saten';
                customMug.studioLighting = 'daylight';
                customMug.layers = [
                    {
                        id: 'layer-preset-text',
                        type: 'text',
                        text: 'NORDIC',
                        font: 'Playfair Display',
                        size: 45,
                        x: 0,
                        y: 690,
                        color: 'auto',
                        side: 'front'
                    }
                ];
                activeLayerId = 'layer-preset-text';
            } 
            else if (presetType === 'gold') {
                customMug.color = '#3D405B'; // Kömür Siyahı
                customMug.colorName = 'Mat Kömür Siyahı';
                customMug.pattern = 'gold-glint'; // Altın Yaldız
                customMug.patternName = 'Altın Yaldız';
                customMug.handle = 'gold'; // Parlak Altın
                customMug.handleName = 'Parlak Altın';
                customMug.handleShape = 'angular-d';
                customMug.handleShapeName = 'Köşeli D';
                customMug.clayTexture = 'glazed';
                customMug.clayTextureName = 'Cilalı Parlak Sır';
                customMug.studioLighting = 'daylight';
                customMug.layers = [
                    {
                        id: 'layer-preset-text',
                        type: 'text',
                        text: 'AURUM',
                        font: 'Cinzel',
                        size: 48,
                        x: 0,
                        y: 690,
                        color: '#D4AF37',
                        side: 'front'
                    }
                ];
                activeLayerId = 'layer-preset-text';
            } 
            else if (presetType === 'terracotta') {
                customMug.color = '#E07A5F'; // Terracotta
                customMug.colorName = 'Toprak Terracotta';
                customMug.pattern = 'speckles'; // Benekli Toprak
                customMug.patternName = 'Benekli Toprak';
                customMug.handle = 'ceramic'; // Bütünsel Kil
                customMug.handleName = 'Bütünsel Kil';
                customMug.handleShape = 'ring-o';
                customMug.handleShapeName = 'Modern O';
                customMug.clayTexture = 'rough';
                customMug.clayTextureName = 'Şamot / Pürüzlü Toprak';
                customMug.studioLighting = 'candlelight';
                customMug.layers = [
                    {
                        id: 'layer-preset-text',
                        type: 'text',
                        text: 'BOHEM',
                        font: 'Dancing Script',
                        size: 52,
                        x: 0,
                        y: 690,
                        color: 'auto',
                        side: 'front'
                    }
                ];
                activeLayerId = 'layer-preset-text';
            } 
            else if (presetType === 'minimal') {
                customMug.color = '#F4F1DE'; // Porselen Krem
                customMug.colorName = 'Porselen Krem';
                customMug.pattern = 'none'; // Sade Mat
                customMug.patternName = 'Sade Mat';
                customMug.handle = 'ceramic'; // Bütünsel Kil
                customMug.handleName = 'Bütünsel Kil';
                customMug.handleShape = 'classic';
                customMug.handleShapeName = 'Klasik C';
                customMug.clayTexture = 'matte';
                customMug.clayTextureName = 'Mat Saten';
                customMug.studioLighting = 'daylight';
                customMug.layers = [
                    {
                        id: 'layer-preset-text',
                        type: 'text',
                        text: 'SADE',
                        font: 'Outfit',
                        size: 45,
                        x: 0,
                        y: 690,
                        color: 'auto',
                        side: 'front'
                    }
                ];
                activeLayerId = 'layer-preset-text';
            }

            // Sync controls with customMug state
            syncCustomizerUI();
            renderLayersList();
            applyThreeChanges();
            updateCustomizerPrice();
        });
    });

    function syncCustomizerUI() {
        // Color dots
        document.querySelectorAll('#color-selectors .color-dot').forEach(dot => {
            dot.classList.remove('active');
            if (dot.getAttribute('data-color') === customMug.color) {
                dot.classList.add('active');
            }
        });
        if (selectedColorLabel) selectedColorLabel.textContent = customMug.colorName;

        // Pattern buttons
        document.querySelectorAll('#pattern-selectors .pattern-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-pattern') === customMug.pattern) {
                btn.classList.add('active');
            }
        });

        // Handle buttons
        document.querySelectorAll('#handle-selectors .handle-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-handle') === customMug.handle) {
                btn.classList.add('active');
            }
        });

        // Handle Shape buttons
        document.querySelectorAll('#handle-shape-selectors .handle-shape-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-shape') === customMug.handleShape) {
                btn.classList.add('active');
            }
        });

        // Clay Texture buttons
        if (clayTextureSelectors) {
            clayTextureSelectors.querySelectorAll('.handle-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-clay-texture') === customMug.clayTexture) {
                    btn.classList.add('active');
                }
            });
        }

        // Studio Lighting buttons
        if (studioLightingSelectors) {
            studioLightingSelectors.querySelectorAll('.handle-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-lighting') === customMug.studioLighting) {
                    btn.classList.add('active');
                }
            });
        }
    }

    // Color Selector
    colorSelectors.addEventListener('click', (e) => {
        if (!e.target.classList.contains('color-dot')) return;
        playSoundEffect('click');

        document.querySelectorAll('#color-selectors .color-dot').forEach(dot => dot.classList.remove('active'));
        e.target.classList.add('active');

        const colorCode = e.target.getAttribute('data-color');
        const colorName = e.target.getAttribute('data-color-name');
        
        customMug.color = colorCode;
        customMug.colorName = colorName;
        selectedColorLabel.textContent = colorName;

        applyThreeChanges();
        updateCustomizerPrice();
    });

    // Pattern Selector
    patternSelectors.addEventListener('click', (e) => {
        const btn = e.target.closest('.pattern-btn');
        if (!btn) return;
        playSoundEffect('click');

        document.querySelectorAll('.pattern-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const patternId = btn.getAttribute('data-pattern');
        customMug.pattern = patternId;
        customMug.patternName = btn.querySelector('span:last-child').textContent;

        applyThreeChanges();
        updateCustomizerPrice();
    });

    // Handle Selector
    handleSelectors.addEventListener('click', (e) => {
        const btn = e.target.closest('.handle-btn');
        if (!btn) return;
        playSoundEffect('click');

        document.querySelectorAll('.handle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const handleType = btn.getAttribute('data-handle');
        customMug.handle = handleType;
        customMug.handleName = btn.querySelector('span').textContent;

        applyThreeChanges();
        updateCustomizerPrice();
    });

    // Handle Shape Selector
    if (handleShapeSelectors) {
        handleShapeSelectors.addEventListener('click', (e) => {
            const btn = e.target.closest('.handle-shape-btn');
            if (!btn) return;
            playSoundEffect('click');

            document.querySelectorAll('.handle-shape-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const shapeType = btn.getAttribute('data-shape');
            customMug.handleShape = shapeType;
            customMug.handleShapeName = btn.querySelector('span').textContent;

            applyThreeChanges();
        });
    }

    // --- Upgraded Layers Personalization Interactive Logic ---
    function renderLayersList() {
        if (!customLayersList) return;

        if (customMug.layers.length === 0) {
            customLayersList.innerHTML = `<span style="font-size:0.8rem; color:var(--color-text-muted); text-align:center; padding:10px; display:block;">Henüz kişiselleştirme ögesi eklemediniz.</span>`;
            if (layerEditPanel) layerEditPanel.style.display = 'none';
            return;
        }

        customLayersList.innerHTML = customMug.layers.map(layer => {
            const isActive = layer.id === activeLayerId;
            const icon = layer.type === 'text' ? 'fa-font' : 'fa-image';
            const title = layer.type === 'text' ? `Metin: "${layer.text}"` : 'Fotoğraf Baskısı';
            const sideText = layer.side === 'back' ? 'Arka Yüz' : 'Ön Yüz';
            
            return `
                <div class="handle-shape-btn ${isActive ? 'active' : ''}" data-layer-id="${layer.id}" style="padding: 10px 12px; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; margin-bottom: 4px; border: 1px solid var(--border-color); border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70%;">
                        <i class="fa-solid ${icon}" style="color:var(--color-primary);"></i>
                        <span style="font-weight: 600;">${title}</span>
                    </div>
                    <span style="font-size: 0.7rem; opacity: 0.6; font-weight: 700;">${sideText}</span>
                </div>
            `;
        }).join('');

        // Attach click listener to layers items
        customLayersList.querySelectorAll('.handle-shape-btn').forEach(item => {
            item.addEventListener('click', () => {
                const layerId = item.getAttribute('data-layer-id');
                activeLayerId = layerId;
                renderLayersList();
                
                const activeLayer = customMug.layers.find(l => l.id === activeLayerId);
                if (activeLayer) {
                    openLayerEditPanel(activeLayer);
                }
            });
        });

        // Ensure the active layer edit panel is synchronized
        const activeLayer = customMug.layers.find(l => l.id === activeLayerId);
        if (activeLayer) {
            openLayerEditPanel(activeLayer);
        } else if (customMug.layers.length > 0) {
            activeLayerId = customMug.layers[0].id;
            openLayerEditPanel(customMug.layers[0]);
        } else {
            if (layerEditPanel) layerEditPanel.style.display = 'none';
        }
    }

    function openLayerEditPanel(layer) {
        if (!layerEditPanel) return;

        layerEditPanel.style.display = 'block';
        editLayerTitle.textContent = layer.type === 'text' ? 'Kazıma Metnini Düzenle' : 'Fotoğraf Baskısını Düzenle';

        // Update side buttons active state
        if (layer.side === 'back') {
            layerSideFrontBtn.classList.remove('active');
            layerSideBackBtn.classList.add('active');
        } else {
            layerSideFrontBtn.classList.add('active');
            layerSideBackBtn.classList.remove('active');
        }

        // Update positions sliders
        layerPosY.value = layer.y;
        layerPosX.value = layer.x;

        // Show specific settings
        if (layer.type === 'text') {
            layerTextSettings.style.display = 'flex';
            layerPhotoSettings.style.display = 'none';

            layerTextInput.value = layer.text;
            layerTextFontSelect.value = layer.font;
            layerTextSize.value = layer.size;

            // Highlight active text color dot
            document.querySelectorAll('#layer-text-color-selectors .color-dot').forEach(dot => {
                dot.classList.remove('active');
                if (dot.getAttribute('data-color') === layer.color) {
                    dot.classList.add('active');
                }
            });
        } else if (layer.type === 'photo') {
            layerTextSettings.style.display = 'none';
            layerPhotoSettings.style.display = 'flex';

            layerPhotoPreview.src = layer.imageBase64 || '';
            layerPhotoScale.value = layer.scale;
        }
    }

    // Add Text Layer
    if (addTextLayerBtn) {
        addTextLayerBtn.addEventListener('click', () => {
            playSoundEffect('success');
            const newId = `layer-text-${Date.now()}`;
            const newLayer = {
                id: newId,
                type: 'text',
                text: 'YENİ YAZI',
                font: 'Outfit',
                size: 45,
                x: 0,
                y: 690,
                color: 'auto',
                side: 'front'
            };
            customMug.layers.push(newLayer);
            activeLayerId = newId;

            renderLayersList();
            applyThreeChanges();
            updateCustomizerPrice();
        });
    }

    // Add Photo Layer
    if (addPhotoLayerBtn) {
        addPhotoLayerBtn.addEventListener('click', () => {
            playSoundEffect('click');
            layerPhotoFileInput.value = '';
            layerPhotoFileInput.click();
        });
    }

    if (layerPhotoFileInput) {
        layerPhotoFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 2 * 1024 * 1024) {
                alert('Fotoğraf boyutu çok büyük (Maksimum 2MB). Lütfen daha küçük çözünürlüklü bir dosya yükleyin.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const newId = `layer-photo-${Date.now()}`;
                    const newLayer = {
                        id: newId,
                        type: 'photo',
                        imageElement: img,
                        imageBase64: event.target.result,
                        scale: 120,
                        x: 0,
                        y: 690,
                        side: 'front'
                    };

                    // If editing an existing photo layer, we replace its image properties, else add a new layer
                    const activeLayer = customMug.layers.find(l => l.id === activeLayerId);
                    if (activeLayer && activeLayer.type === 'photo') {
                        activeLayer.imageElement = img;
                        activeLayer.imageBase64 = event.target.result;
                    } else {
                        customMug.layers.push(newLayer);
                        activeLayerId = newId;
                    }

                    renderLayersList();
                    applyThreeChanges();
                    updateCustomizerPrice();
                    playSoundEffect('success');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Trigger photo change from edit panel
    if (layerChangePhotoBtn) {
        layerChangePhotoBtn.addEventListener('click', () => {
            playSoundEffect('click');
            layerPhotoFileInput.click();
        });
    }

    // Delete Layer
    if (deleteLayerBtn) {
        deleteLayerBtn.addEventListener('click', () => {
            playSoundEffect('error');
            customMug.layers = customMug.layers.filter(l => l.id !== activeLayerId);
            activeLayerId = customMug.layers.length > 0 ? customMug.layers[0].id : null;

            renderLayersList();
            applyThreeChanges();
            updateCustomizerPrice();
        });
    }

    // Side selection buttons
    if (layerSideFrontBtn) {
        layerSideFrontBtn.addEventListener('click', () => {
            const activeLayer = customMug.layers.find(l => l.id === activeLayerId);
            if (activeLayer) {
                playSoundEffect('click');
                activeLayer.side = 'front';
                renderLayersList();
                applyThreeChanges();
            }
        });
    }

    // Side selection buttons
    if (layerSideBackBtn) {
        layerSideBackBtn.addEventListener('click', () => {
            const activeLayer = customMug.layers.find(l => l.id === activeLayerId);
            if (activeLayer) {
                playSoundEffect('click');
                activeLayer.side = 'back';
                renderLayersList();
                applyThreeChanges();
            }
        });
    }

    // Positions inputs
    if (layerPosY) {
        layerPosY.addEventListener('input', (e) => {
            const activeLayer = customMug.layers.find(l => l.id === activeLayerId);
            if (activeLayer) {
                activeLayer.y = parseInt(e.target.value);
                applyThreeChanges();
            }
        });
    }

    if (layerPosX) {
        layerPosX.addEventListener('input', (e) => {
            const activeLayer = customMug.layers.find(l => l.id === activeLayerId);
            if (activeLayer) {
                activeLayer.x = parseInt(e.target.value);
                applyThreeChanges();
            }
        });
    }

    // Text specific input handlers
    if (layerTextInput) {
        layerTextInput.addEventListener('input', (e) => {
            const activeLayer = customMug.layers.find(l => l.id === activeLayerId);
            if (activeLayer && activeLayer.type === 'text') {
                let text = e.target.value.toUpperCase();
                text = text.replace(/[^A-ZÇĞİÖŞÜ0-9 ]/g, ''); // Allow letters & numbers
                e.target.value = text;

                activeLayer.text = text;
                renderLayersList();
                applyThreeChanges();
            }
        });
    }

    if (layerTextFontSelect) {
        layerTextFontSelect.addEventListener('change', (e) => {
            const activeLayer = customMug.layers.find(l => l.id === activeLayerId);
            if (activeLayer && activeLayer.type === 'text') {
                playSoundEffect('click');
                activeLayer.font = e.target.value;
                applyThreeChanges();
            }
        });
    }

    if (layerTextSize) {
        layerTextSize.addEventListener('input', (e) => {
            const activeLayer = customMug.layers.find(l => l.id === activeLayerId);
            if (activeLayer && activeLayer.type === 'text') {
                activeLayer.size = parseInt(e.target.value);
                applyThreeChanges();
            }
        });
    }

    // Text Color Selectors
    if (layerTextColorSelectors) {
        layerTextColorSelectors.addEventListener('click', (e) => {
            const dot = e.target.closest('.color-dot');
            if (!dot) return;
            playSoundEffect('click');

            const activeLayer = customMug.layers.find(l => l.id === activeLayerId);
            if (activeLayer && activeLayer.type === 'text') {
                activeLayer.color = dot.getAttribute('data-color');
                
                document.querySelectorAll('#layer-text-color-selectors .color-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');

                applyThreeChanges();
            }
        });
    }

    // Photo specific scale input handler
    if (layerPhotoScale) {
        layerPhotoScale.addEventListener('input', (e) => {
            const activeLayer = customMug.layers.find(l => l.id === activeLayerId);
            if (activeLayer && activeLayer.type === 'photo') {
                activeLayer.scale = parseInt(e.target.value);
                applyThreeChanges();
            }
        });
    }

    // Dynamic event delegation for shop storefront gallery cards
    if (shopGalleryGrid) {
        shopGalleryGrid.addEventListener('click', (e) => {
            const quickAddBtn = e.target.closest('.add-to-cart-quick');
            const textAddBtn = e.target.closest('.add-cart-text-action');
            const customizeBtn = e.target.closest('.customize-product-btn');
            
            const card = e.target.closest('.mug-card');
            if (!card) return;
            
            const productId = card.getAttribute('data-id');
            const product = getProductById(productId);
            if (!product) return;

            if (quickAddBtn || textAddBtn) {
                e.stopPropagation();
                playSoundEffect('success');
                addToCart({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    img: product.image,
                    meta: `${product.category} - Zanaat Serisi`,
                    qty: 1
                });
            } else if (customizeBtn) {
                e.stopPropagation();
                playSoundEffect('click');
                
                // Set customization attributes based on product type
                if (product.id === 'toprak-hissiyati') {
                    simulateColorDotClick('#81B29A', 'Adaçayı Yeşili');
                    simulatePatternClick('none');
                    simulateHandleClick('wood');
                } else if (product.id === 'karanlik-gunes') {
                    simulateColorDotClick('#3D405B', 'Mat Kömür Siyahı');
                    simulatePatternClick('none');
                    simulateHandleClick('gold');
                } else if (product.id === 'kozmik-gezgin') {
                    simulateColorDotClick('#4F5D75', 'İndigo Mavi');
                    simulatePatternClick('gold-glint');
                    simulateHandleClick('gold');
                } else if (product.id === 'siber-hanem') {
                    simulateColorDotClick('#3D405B', 'Mat Kömür Siyahı');
                    simulatePatternClick('stripes');
                    simulateHandleClick('brass');
                } else {
                    // Default values for added products
                    simulateColorDotClick('#F4F1DE', 'Porselen Krem');
                    simulatePatternClick('none');
                    simulateHandleClick('ceramic');
                }
                
                document.getElementById('atolye').scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // --- Admin Panel Event Listeners ---
    if (adminLoginTrigger) {
        adminLoginTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            playSoundEffect('click');
            adminPassInput.value = '';
            adminLoginError.style.display = 'none';
            adminLoginModal.classList.add('open');
            adminPassInput.focus();
        });
    }

    if (adminLoginClose) {
        adminLoginClose.addEventListener('click', () => {
            playSoundEffect('click');
            adminLoginModal.classList.remove('open');
        });
    }

    // Upgraded Tab Switcher Elements and Event Listeners
    const adminNavTabs = document.querySelectorAll('.admin-nav-tab');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');

    adminNavTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            playSoundEffect('click');
            const targetId = tab.getAttribute('data-target');
            
            adminNavTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            adminTabContents.forEach(content => {
                content.style.display = 'none';
                content.classList.remove('active');
            });

            const activeContent = document.getElementById(targetId);
            if (activeContent) {
                activeContent.style.display = 'block';
                setTimeout(() => activeContent.classList.add('active'), 30);
            }

            // Route tab renderers
            if (targetId === 'admin-tab-stats') {
                updateStatsDashboard();
            } else if (targetId === 'admin-tab-orders') {
                renderAdminOrders();
            } else if (targetId === 'admin-tab-catalog') {
                renderAdminCatalog();
            }
        });
    });

    if (adminLoginSubmit) {
        adminLoginSubmit.addEventListener('click', () => {
            if (adminPassInput.value === '1234') {
                playSoundEffect('success');
                adminLoginModal.classList.remove('open');
                
                // Initialize default tab to Stats
                adminNavTabs.forEach(t => t.classList.remove('active'));
                const statsTabBtn = document.querySelector('[data-target="admin-tab-stats"]');
                if (statsTabBtn) statsTabBtn.classList.add('active');
                
                adminTabContents.forEach(content => {
                    content.style.display = 'none';
                    content.classList.remove('active');
                });
                
                const statsContent = document.getElementById('admin-tab-stats');
                if (statsContent) {
                    statsContent.style.display = 'block';
                    statsContent.classList.add('active');
                }
                
                updateStatsDashboard();
                updateOrdersBadge();
                adminDashboardModal.classList.add('open');
            } else {
                playSoundEffect('error');
                adminLoginError.style.display = 'block';
            }
        });
    }

    if (adminPassInput) {
        adminPassInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                adminLoginSubmit.click();
            }
        });
    }

    if (adminDashboardClose) {
        adminDashboardClose.addEventListener('click', () => {
            playSoundEffect('click');
            adminDashboardModal.classList.remove('open');
        });
    }

    // Upgraded Product Edit / Delete Delegation Event
    if (adminProductList) {
        adminProductList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.admin-prod-delete-btn');
            const editBtn = e.target.closest('.admin-prod-edit-btn');
            
            if (deleteBtn) {
                const deleteId = deleteBtn.getAttribute('data-delete-id');
                playSoundEffect('error');
                
                // Filter out item
                catalog = catalog.filter(p => p.id !== deleteId);
                localStorage.setItem('kupahanem_catalog', JSON.stringify(catalog));
                
                // If editing the deleted item, reset editing mode
                if (editProdId && editProdId.value === deleteId) {
                    resetCatalogForm();
                }
                
                // Re-render components
                renderAdminCatalog();
                renderShopCatalog();
                updateStatsDashboard();
            }
            else if (editBtn) {
                const editId = editBtn.getAttribute('data-edit-id');
                playSoundEffect('click');
                startProductEdit(editId);
            }
        });
    }

    function startProductEdit(id) {
        const product = getProductById(id);
        if (!product) return;

        editProdId.value = product.id;
        newProdTitle.value = product.title;
        newProdPrice.value = product.price;
        newProdCategory.value = product.category;
        newProdDesc.value = product.desc;
        newProdVolume.value = product.volume;
        newProdHeat.value = product.heat;

        if (product.image && product.image.startsWith('data:image')) {
            uploadedImageBase64 = product.image;
            uploadPreviewImg.src = product.image;
            uploadFileName.textContent = 'Yüklenen Görsel';
            uploadPreviewContainer.style.display = 'flex';
        } else {
            uploadedImageBase64 = '';
            newProdImage.value = product.image || 'assets/nordic_forest.jpg';
            uploadPreviewContainer.style.display = 'none';
        }

        catalogFormTitle.textContent = 'Ürünü Düzenle';
        submitProdBtnText.textContent = 'Ürünü Güncelle';
        submitProdBtnIcon.className = 'fa-solid fa-check';
        cancelEditBtn.style.display = 'flex';
    }

    function resetCatalogForm() {
        addProductForm.reset();
        editProdId.value = '';
        newProdImageFile.value = '';
        uploadedImageBase64 = '';
        if (uploadPreviewContainer) uploadPreviewContainer.style.display = 'none';

        catalogFormTitle.textContent = 'Yeni Ürün Ekle';
        submitProdBtnText.textContent = 'Ürünü Kataloğa Ekle';
        submitProdBtnIcon.className = 'fa-solid fa-plus';
        cancelEditBtn.style.display = 'none';
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => {
            playSoundEffect('click');
            resetCatalogForm();
        });
    }

    // Image Upload Events
    if (customUploadBtn) {
        customUploadBtn.addEventListener('click', () => {
            playSoundEffect('click');
            newProdImageFile.click();
        });
    }

    if (newProdImageFile) {
        newProdImageFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 1.5 * 1024 * 1024) {
                alert('Görsel boyutu çok büyük (Maksimum 1.5MB). Lütfen daha küçük bir görsel yükleyin.');
                newProdImageFile.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                uploadedImageBase64 = event.target.result;
                uploadPreviewImg.src = event.target.result;
                uploadFileName.textContent = file.name;
                uploadPreviewContainer.style.display = 'flex';
                playSoundEffect('success');
            };
            reader.readAsDataURL(file);
        });
    }

    if (cancelUploadBtn) {
        cancelUploadBtn.addEventListener('click', () => {
            playSoundEffect('click');
            newProdImageFile.value = '';
            uploadedImageBase64 = '';
            uploadPreviewContainer.style.display = 'none';
        });
    }

    // Upgraded Add/Edit Product Form Submit Event
    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            playSoundEffect('success');
            
            const isEditing = editProdId.value !== '';
            
            if (isEditing) {
                const prodId = editProdId.value;
                const product = getProductById(prodId);
                if (product) {
                    product.title = newProdTitle.value;
                    product.price = parseInt(newProdPrice.value);
                    product.image = uploadedImageBase64 || newProdImage.value;
                    product.desc = newProdDesc.value;
                    product.category = newProdCategory.value;
                    product.volume = newProdVolume.value;
                    product.heat = newProdHeat.value;
                    
                    localStorage.setItem('kupahanem_catalog', JSON.stringify(catalog));
                    alert('Kupa bilgileri başarıyla güncellendi!');
                }
            } else {
                const newId = `product-${Date.now()}`;
                const newProduct = {
                    id: newId,
                    title: newProdTitle.value,
                    price: parseInt(newProdPrice.value),
                    image: uploadedImageBase64 || newProdImage.value,
                    desc: newProdDesc.value,
                    category: newProdCategory.value,
                    volume: newProdVolume.value,
                    heat: newProdHeat.value
                };

                catalog.push(newProduct);
                localStorage.setItem('kupahanem_catalog', JSON.stringify(catalog));
                alert('Yeni kupa zanaat kataloğuna başarıyla eklendi!');
            }

            // Reset form inputs & file upload previews
            resetCatalogForm();
            
            // Re-render lists
            renderAdminCatalog();
            renderShopCatalog();
            updateStatsDashboard();
        });
    }

    // --- Upgraded Admin Rendering & Logic Operations ---
    function updateOrdersBadge() {
        if (adminOrdersBadge) {
            adminOrdersBadge.textContent = orders.length;
        }
    }

    function updateStatsDashboard() {
        if (!statRevenue) return;

        // Calculate Revenue
        const totalRev = orders.reduce((sum, o) => sum + o.total, 0);
        statRevenue.textContent = `${totalRev} TL`;

        // Calculate Orders Count
        statOrders.textContent = orders.length;

        // Calculate Avg Order Value
        const avgVal = orders.length > 0 ? Math.round(totalRev / orders.length) : 0;
        statAvgValue.textContent = `${avgVal} TL`;

        // Catalog count
        statProducts.textContent = catalog.length;

        // Custom vs Catalog count
        let customCount = 0;
        let catalogCount = 0;
        orders.forEach(o => {
            o.items.forEach(item => {
                if (item.id && item.id.startsWith('custom-')) {
                    customCount += item.qty;
                } else {
                    catalogCount += item.qty;
                }
            });
        });

        const totalItems = customCount + catalogCount;
        const customPercent = totalItems > 0 ? Math.round((customCount / totalItems) * 100) : 35;
        const catalogPercent = totalItems > 0 ? Math.round((catalogCount / totalItems) * 100) : 65;

        if (statCustomPercent) statCustomPercent.textContent = `%${customPercent}`;
        if (statCatalogPercent) statCatalogPercent.textContent = `%${catalogPercent}`;
        
        if (statCustomBar) statCustomBar.style.width = `${customPercent}%`;
        if (statCatalogBar) statCatalogBar.style.width = `${catalogPercent}%`;


    }

    function renderAdminOrders() {
        if (!adminOrdersListBody) return;

        if (orders.length === 0) {
            adminOrdersListBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 2rem;">
                        Henüz sipariş bulunmuyor.
                    </td>
                </tr>
            `;
            return;
        }

        adminOrdersListBody.innerHTML = orders.map(o => {
            let statusClass = 'badge-status-hazirlaniyor';
            if (o.status === 'Fırınlanıyor') statusClass = 'badge-status-firinlaniyor';
            else if (o.status === 'Kargoda') statusClass = 'badge-status-kargoda';
            else if (o.status === 'Tamamlandı') statusClass = 'badge-status-tamamlandi';

            return `
                <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 12px 15px; font-weight: 700; color: var(--color-heading);">${o.id}</td>
                    <td style="padding: 12px 15px; color: var(--color-text-muted);">${o.date} <span style="font-size:0.75rem;">${o.time}</span></td>
                    <td style="padding: 12px 15px; font-weight: 600;">${o.total} TL</td>
                    <td style="padding: 12px 15px;">
                        <span class="badge-status ${statusClass}">${o.status}</span>
                    </td>
                    <td style="padding: 12px 15px; text-align: right; display: flex; gap: 8px; justify-content: flex-end; align-items: center; min-height: 48px;">
                        <select class="admin-order-status-select" data-order-id="${o.id}" style="padding: 5px 8px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.8rem; background: #FFF; outline: none; cursor: pointer;">
                            <option value="Hazırlanıyor" ${o.status === 'Hazırlanıyor' ? 'selected' : ''}>Hazırlanıyor</option>
                            <option value="Fırınlanıyor" ${o.status === 'Fırınlanıyor' ? 'selected' : ''}>Fırınlanıyor</option>
                            <option value="Kargoda" ${o.status === 'Kargoda' ? 'selected' : ''}>Kargoda</option>
                            <option value="Tamamlandı" ${o.status === 'Tamamlandı' ? 'selected' : ''}>Tamamlandı</option>
                        </select>
                        <button class="action-btn text-btn admin-view-order-btn" data-order-id="${o.id}" style="padding: 6px 12px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 4px; font-weight: 600;">
                            Detay <i class="fa-solid fa-chevron-down"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Attach event listeners to status selectors
        adminOrdersListBody.querySelectorAll('.admin-order-status-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const orderId = select.getAttribute('data-order-id');
                const newStatus = e.target.value;
                playSoundEffect('success');
                
                const order = orders.find(o => o.id === orderId);
                if (order) {
                    order.status = newStatus;
                    localStorage.setItem('kupahanem_orders', JSON.stringify(orders));
                    
                    // Re-render components
                    renderAdminOrders();
                    updateStatsDashboard();
                }
            });
        });

        // Attach event listeners to view detail buttons
        adminOrdersListBody.querySelectorAll('.admin-view-order-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = btn.getAttribute('data-order-id');
                playSoundEffect('click');
                showOrderDetail(orderId);
            });
        });
    }

    function showOrderDetail(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order || !adminOrderDetailPanel) return;

        detailOrderTitle.innerHTML = `Sipariş <strong>${order.id}</strong> Detayları`;

        let itemsHtml = order.items.map(item => {
            return `
                <div style="display: flex; gap: 15px; border-bottom: 1px dashed var(--border-color); padding: 10px 0; align-items: center;">
                    <img src="${item.img}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);">
                    <div style="flex-grow: 1;">
                        <h6 style="font-weight: 700; margin: 0; color: var(--color-heading); font-size: 0.85rem;">${item.qty}x ${item.title} (${item.price} TL)</h6>
                        <p style="margin: 3px 0 0; color: var(--color-text-muted); font-size: 0.75rem;">${item.meta}</p>
                    </div>
                    <div style="font-weight: 700; color: var(--color-heading); font-size: 0.85rem;">${item.qty * item.price} TL</div>
                </div>
            `;
        }).join('');

        detailOrderContent.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1rem;" class="admin-panel-grid">
                <div>
                    <strong style="display:block; margin-bottom:5px; font-size:0.85rem;">Sipariş Bilgileri:</strong>
                    <p style="margin: 4px 0;">Kodu: <strong style="color: var(--color-primary);">${order.id}</strong></p>
                    <p style="margin: 4px 0;">Tarih/Saat: ${order.date} - ${order.time}</p>
                </div>
                <div>
                    <strong style="display:block; margin-bottom:5px; font-size:0.85rem;">Ödeme & Tutar:</strong>
                    <p style="margin: 4px 0;">Ödeme Yöntemi: NFC Kredi Kartı</p>
                    <p style="margin: 4px 0;">Genel Toplam: <strong style="color: var(--color-primary); font-size: 0.95rem;">${order.total} TL</strong></p>
                </div>
            </div>
            <div style="border-top: 1px solid var(--border-color); padding-top: 10px;">
                <strong style="display:block; margin-bottom:5px; font-size:0.85rem;">Sipariş Verilen Kupalar:</strong>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    ${itemsHtml}
                </div>
            </div>
        `;

        adminOrderDetailPanel.style.display = 'block';
        adminOrderDetailPanel.scrollIntoView({ behavior: 'smooth' });
    }

    if (closeOrderDetailBtn) {
        closeOrderDetailBtn.addEventListener('click', () => {
            playSoundEffect('click');
            adminOrderDetailPanel.style.display = 'none';
        });
    }



    function simulateColorDotClick(color, name) {
        const dot = colorSelectors.querySelector(`[data-color="${color}"]`);
        if (dot) dot.click();
    }
    function simulatePatternClick(pattern) {
        const pat = patternSelectors.querySelector(`[data-pattern="${pattern}"]`);
        if (pat) pat.click();
    }
    function simulateHandleClick(handle) {
        const hand = handleSelectors.querySelector(`[data-handle="${handle}"]`);
        if (hand) hand.click();
    }

    // Add Custom Mug to Cart
    addCustomCartBtn.addEventListener('click', () => {
        const finalPrice = parseInt(customTotalPrice.textContent);
        const uniqueId = `custom-${Date.now()}`;
        
        // Generate dynamic layers meta
        let layersMeta = '';
        if (customMug.layers && customMug.layers.length > 0) {
            layersMeta = ' | Ögeler: ' + customMug.layers.map(l => {
                const sideText = l.side === 'back' ? 'Arka' : 'Ön';
                if (l.type === 'text') {
                    return `<strong>"${l.text}"</strong> (Metin-${sideText}-${l.font})`;
                } else {
                    return `<strong>Görsel</strong> (${sideText})`;
                }
            }).join(', ');
        } else {
            layersMeta = ' | Sade';
        }

        addToCart({
            id: uniqueId,
            title: `Özel Tasarım Kupa`,
            price: finalPrice,
            img: 'assets/sade_beyaz.jpg', 
            meta: `Sır: <strong>${customMug.colorName}</strong> | Doku: <strong>${customMug.clayTextureName}</strong> | Kulp: <strong>${customMug.handleName} (${customMug.handleShapeName})</strong>${layersMeta}`,
            qty: 1
        });
        
        // Reset customMug layers back to default text layer
        customMug.layers = [
            {
                id: 'layer-default-text',
                type: 'text',
                text: 'KUPAHANEM',
                font: 'Outfit',
                size: 45,
                x: 0,
                y: 690,
                color: 'auto',
                side: 'front'
            }
        ];
        activeLayerId = 'layer-default-text';

        // Re-render layers list UI
        renderLayersList();
        applyThreeChanges();
        updateCustomizerPrice();
    });


    // --- Kupa Keşif Ritüeli (Quiz) ---
    let currentQuizStep = 0;
    let quizWeights = {
        'siber-hanem': 0,
        'kozmik-gezgin': 0,
        'toprak-hissiyati': 0,
        'karanlik-gunes': 0
    };

    quizBox.addEventListener('click', (e) => {
        const option = e.target.closest('.quiz-option-btn');
        if (!option) return;
        playSoundEffect('click');

        const weight = option.getAttribute('data-weight');
        if (weight) {
            quizWeights[weight] += 1;
        }

        goToNextQuizStep();
    });

    function goToNextQuizStep() {
        const currentSlide = quizSlides[currentQuizStep];
        currentSlide.classList.remove('active');

        currentQuizStep++;
        const nextSlide = quizSlides[currentQuizStep];
        
        const totalSteps = quizSlides.length - 1;
        const progressPercentage = ((currentQuizStep) / totalSteps) * 100;
        quizProgress.style.width = `${Math.min(progressPercentage, 100)}%`;

        if (nextSlide) {
            nextSlide.classList.add('active');
            
            if (nextSlide.getAttribute('data-step') === 'result') {
                calculateQuizResult();
            }
        }
    }

    function calculateQuizResult() {
        let winningProduct = 'toprak-hissiyati'; 
        let maxWeight = -1;

        for (const [prodId, weight] of Object.entries(quizWeights)) {
            if (weight > maxWeight) {
                maxWeight = weight;
                winningProduct = prodId;
            }
        }

        const product = getProductById(winningProduct) || defaultCatalog.find(p => p.id === winningProduct);
        if (product) {
            recommendedMugTitle.textContent = product.title;
            recommendedMugImg.src = product.image;
            recommendedMugDesc.textContent = product.desc;
        }
        
        addRecommendedToCartBtn.setAttribute('data-id', winningProduct);
    }

    addRecommendedToCartBtn.addEventListener('click', () => {
        const prodId = addRecommendedToCartBtn.getAttribute('data-id');
        const product = getProductById(prodId) || defaultCatalog.find(p => p.id === prodId);
        
        if (product) {
            const discountedPrice = Math.round(product.price * 0.9);
            
            addToCart({
                id: `${prodId}-ritual`,
                title: `${product.title} (Ritüel Özel)`,
                price: discountedPrice,
                img: product.image,
                meta: 'Zanaat Ritüeli İndirimi (%10)',
                qty: 1
            });
            
            toggleCartDrawer(true);
        }
    });

    restartQuizBtn.addEventListener('click', () => {
        playSoundEffect('click');
        currentQuizStep = 0;
        quizWeights = {
            'siber-hanem': 0,
            'kozmik-gezgin': 0,
            'toprak-hissiyati': 0,
            'karanlik-gunes': 0
        };

        quizSlides.forEach(slide => slide.classList.remove('active'));
        quizSlides[0].classList.add('active');
        quizProgress.style.width = '25%';
    });


    // --- Cart Actions ---
    function addToCart(item) {
        playSoundEffect('success');
        
        const existingItem = cart.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push(item);
        }

        updateCartState();
        renderCart();
        toggleCartDrawer(true);
    }

    function toggleCartDrawer(open) {
        playSoundEffect('click');
        if (open) {
            cartDrawer.classList.add('open');
        } else {
            cartDrawer.classList.remove('open');
        }
    }

    cartToggleBtn.addEventListener('click', () => toggleCartDrawer(true));
    cartCloseBtn.addEventListener('click', () => toggleCartDrawer(false));
    document.querySelector('.cart-drawer-overlay').addEventListener('click', () => toggleCartDrawer(false));

    function updateCartState() {
        localStorage.setItem('kupahanem_cart', JSON.stringify(cart));
        const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
        cartBadge.textContent = totalItems;
        
        if (totalItems > 0) {
            checkoutBtn.removeAttribute('disabled');
        } else {
            checkoutBtn.setAttribute('disabled', 'true');
        }
    }

    function renderCart() {
        if (cart.length === 0) {
            cartItemsWrapper.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fa-solid fa-hourglass-empty"></i>
                    <p>Sepetiniz şu an boş. Atölyeden birkaç kupa ekleyin!</p>
                </div>
            `;
            cartTotalPrice.textContent = '0 TL';
            return;
        }

        let html = '';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;

            html += `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.img}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-meta">${item.meta}</div>
                        <div class="cart-item-price-row">
                            <span class="cart-item-price">${item.price} TL</span>
                            <div class="quantity-controller">
                                <span class="qty-btn minus-qty"><i class="fa-solid fa-minus"></i></span>
                                <span class="qty-val">${item.qty}</span>
                                <span class="qty-btn plus-qty"><i class="fa-solid fa-plus"></i></span>
                            </div>
                        </div>
                    </div>
                    <span class="remove-item-btn"><i class="fa-solid fa-trash-can"></i></span>
                </div>
            `;
        });

        cartItemsWrapper.innerHTML = html;
        cartTotalPrice.textContent = `${total} TL`;

        bindCartItemEvents();
    }

    function bindCartItemEvents() {
        cartItemsWrapper.querySelectorAll('.cart-item').forEach(card => {
            const itemId = card.getAttribute('data-id');

            card.querySelector('.minus-qty').addEventListener('click', () => {
                updateItemQty(itemId, -1);
            });

            card.querySelector('.plus-qty').addEventListener('click', () => {
                updateItemQty(itemId, 1);
            });

            card.querySelector('.remove-item-btn').addEventListener('click', () => {
                removeItemFromCart(itemId);
            });
        });
    }

    function updateItemQty(id, delta) {
        playSoundEffect('click');
        const item = cart.find(i => i.id === id);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) {
                removeItemFromCart(id);
                return;
            }
        }
        updateCartState();
        renderCart();
    }

    function removeItemFromCart(id) {
        playSoundEffect('click');
        cart = cart.filter(i => i.id !== id);
        updateCartState();
        renderCart();
    }

    // --- Checkout Fişi ---
    checkoutBtn.addEventListener('click', () => {
        toggleCartDrawer(false);
        playSoundEffect('success');
        
        const randomSerial = `KH-${Math.floor(10000000 + Math.random() * 90000000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
        ticketIdElement.textContent = randomSerial;
        
        const today = new Date();
        ticketDateElement.textContent = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;

        let itemsHtml = '';
        let grandTotal = 0;

        cart.forEach(item => {
            const lineTotal = item.price * item.qty;
            grandTotal += lineTotal;
            itemsHtml += `
                <div class="ticket-item-row">
                    <span>${item.qty}x ${item.title}</span>
                    <span class="ticket-item-name">${lineTotal} TL</span>
                </div>
            `;
        });

        ticketItemsWrapper.innerHTML = itemsHtml;
        ticketTotalElement.textContent = `${grandTotal} TL`;

        checkoutModal.classList.add('open');
    });

    function closeModal() {
        playSoundEffect('click');
        checkoutModal.classList.remove('open');
    }

    modalCloseBtn.addEventListener('click', closeModal);
    document.querySelector('.modal-overlay').addEventListener('click', closeModal);

    completeOrderBtn.addEventListener('click', () => {
        playSoundEffect('success');
        
        // Save current cart items as a new order in orders list
        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
        const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
        const orderId = ticketIdElement.textContent;
        const grandTotal = parseInt(ticketTotalElement.textContent);
        
        const newOrder = {
            id: orderId,
            date: dateStr,
            time: timeStr,
            items: [...cart],
            total: grandTotal,
            status: 'Hazırlanıyor'
        };
        
        orders.unshift(newOrder); // Add to the top
        localStorage.setItem('kupahanem_orders', JSON.stringify(orders));
        
        // Populate certificate specs dynamically before clearing cart
        if (certSerialNumber) {
            certSerialNumber.textContent = orderId;
        }

        if (certSpecsList) {
            let specsHtml = '';
            
            // Check if there are custom mugs in this order
            const customItems = cart.filter(item => item.id.startsWith('custom-'));
            if (customItems.length > 0) {
                specsHtml += `
                    <div class="cert-spec-item" style="display:flex; justify-content:space-between; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
                        <span class="cert-spec-label" style="font-weight:600; color:var(--color-text-muted);">Kil Sır Rengi:</span>
                        <span class="cert-spec-value" style="font-weight:700; color: ${customMug.color};">${customMug.colorName}</span>
                    </div>
                    <div class="cert-spec-item" style="display:flex; justify-content:space-between; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
                        <span class="cert-spec-label" style="font-weight:600; color:var(--color-text-muted);">Yüzey Dokusu:</span>
                        <span class="cert-spec-value" style="font-weight:700;">${customMug.clayTextureName}</span>
                    </div>
                    <div class="cert-spec-item" style="display:flex; justify-content:space-between; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
                        <span class="cert-spec-label" style="font-weight:600; color:var(--color-text-muted);">Kulp Tasarımı:</span>
                        <span class="cert-spec-value" style="font-weight:700;">${customMug.handleName} (${customMug.handleShapeName})</span>
                    </div>
                    <div class="cert-spec-item" style="display:flex; justify-content:space-between; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
                        <span class="cert-spec-label" style="font-weight:600; color:var(--color-text-muted);">Desen Şekli:</span>
                        <span class="cert-spec-value" style="font-weight:700;">${customMug.patternName}</span>
                    </div>
                `;

                if (customMug.layers && customMug.layers.length > 0) {
                    const layersSummary = customMug.layers.map(l => {
                        const sideStr = l.side === 'back' ? 'Arka Yüz' : 'Ön Yüz';
                        return l.type === 'text' ? `"${l.text}" (Metin - ${sideStr})` : `Özel Görsel (${sideStr})`;
                    }).join(', ');
                    
                    specsHtml += `
                        <div class="cert-spec-item" style="display:flex; justify-content:space-between; padding: 4px 0;">
                            <span class="cert-spec-label" style="font-weight:600; color:var(--color-text-muted);">Zanaat Katmanları:</span>
                            <span class="cert-spec-value" style="font-weight:700; font-size:0.75rem; text-align:right; max-width:60%;">${layersSummary}</span>
                        </div>
                    `;
                }
            } else {
                specsHtml += `
                    <div class="cert-spec-item" style="display:flex; justify-content:space-between; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
                        <span class="cert-spec-label" style="font-weight:600; color:var(--color-text-muted);">Ürün Modelleri:</span>
                        <span class="cert-spec-value" style="font-weight:700;">${cart.map(item => `${item.qty}x ${item.title}`).join(', ')}</span>
                    </div>
                    <div class="cert-spec-item" style="display:flex; justify-content:space-between; padding: 4px 0;">
                        <span class="cert-spec-label" style="font-weight:600; color:var(--color-text-muted);">Zanaat Tipi:</span>
                        <span class="cert-spec-value" style="font-weight:700;">KupaHanem Koleksiyon Serisi</span>
                    </div>
                `;
            }
            certSpecsList.innerHTML = specsHtml;
        }

        cart = [];
        updateCartState();
        renderCart();
        closeModal();

        // Open the certificate modal
        if (certificateModal) {
            certificateModal.classList.add('open');
        }
    });

    printTicketBtn.addEventListener('click', () => {
        playSoundEffect('click');
        window.print();
    });

    // --- Certificate Actions ---
    function downloadCertificateAsImage(orderId) {
        // Create offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        // Fill background with warm off-white parchment feel
        ctx.fillStyle = '#FCFBF7';
        ctx.fillRect(0, 0, 1200, 800);

        // Draw parchment subtle pattern (random soft dots)
        ctx.fillStyle = 'rgba(212, 175, 55, 0.04)';
        for (let i = 0; i < 1200; i += 40) {
            for (let j = 0; j < 800; j += 40) {
                ctx.beginPath();
                ctx.arc(i + (j % 30), j + (i % 20), 1.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw double gold border
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, 1160, 760);

        ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(32, 32, 1136, 736);

        // Draw elegant calligraphic golden circle
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(600, 110, 40, 0, Math.PI * 2);
        ctx.stroke();

        // Draw a miniature calligraphic golden mug inside
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.roundRect(585, 95, 30, 30, [0, 0, 8, 8]);
        ctx.fill();
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(615, 110, 8, -Math.PI/2, Math.PI/2);
        ctx.stroke();

        // Texts
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Brand Title
        ctx.font = 'bold 36px "Outfit", sans-serif';
        ctx.fillStyle = '#2D1F1A';
        ctx.fillText('KupaHanem', 600, 185);

        // Subtitle
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.fillStyle = '#D4AF37';
        ctx.fillText('ZANAAT VE ÖZGÜNLÜK SERTİFİKASI', 600, 225);

        // Serial box text
        ctx.font = '700 13px "Outfit", sans-serif';
        ctx.fillStyle = '#4A3A35';
        ctx.fillText(`SERİ NO: ${orderId}`, 600, 260);

        // Statement text
        ctx.font = 'italic 20px "Playfair Display", Georgia, serif';
        ctx.fillStyle = '#2D1F1A';
        const line1 = "Bu sertifika, yukarıda seri numarası belirtilen çömlek kupanın KupaHanem Butik Atölyesinde tamamen";
        const line2 = "el işçiliğiyle biçimlendirilip sırlanarak yüksek sıcaklıkta fırınlandığını tescil eder. Sınırlı üretim";
        const line3 = "olan bu sanat eseri, zanaatkar koordinatörlüğünde tamamen kişiye özel detaylarla tasarlanmıştır.";
        ctx.fillText(line1, 600, 315);
        ctx.fillText(line2, 600, 345);
        ctx.fillText(line3, 600, 375);

        // Specifications Card Table background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = '#EFECE6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(180, 420, 840, 200, 12);
        ctx.fill();
        ctx.stroke();

        // Header inside spec box
        ctx.font = 'bold 14px "Outfit", sans-serif';
        ctx.fillStyle = '#e07a5f';
        ctx.fillText('KİŞİSELLEŞTİRİLMİŞ ESER DETAYLARI', 600, 445);

        // Draw spec rows
        const drawSpecRow = (label, val, y) => {
            ctx.textAlign = 'left';
            ctx.fillStyle = '#665c54';
            ctx.font = '600 14px "Outfit", sans-serif';
            ctx.fillText(label, 220, y);
            
            ctx.textAlign = 'right';
            ctx.fillStyle = '#2D1F1A';
            ctx.font = '700 14px "Outfit", sans-serif';
            ctx.fillText(val, 980, y);

            // Dashed separator line
            ctx.strokeStyle = 'rgba(45, 31, 26, 0.08)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.setLineDash([5, 5]);
            ctx.moveTo(330, y);
            ctx.lineTo(870, y);
            ctx.stroke();
            ctx.setLineDash([]);
        };

        let yPos = 490;
        const specRows = document.querySelectorAll('#cert-specs-list .cert-spec-item');
        if (specRows.length > 0) {
            specRows.forEach((row, index) => {
                const label = row.querySelector('.cert-spec-label').textContent.trim();
                const value = row.querySelector('.cert-spec-value').textContent.trim();
                drawSpecRow(label, value, yPos + (index * 32));
            });
        } else {
            drawSpecRow('Eser Tipi:', 'KupaHanem Özel Koleksiyon Kupası', 490);
            drawSpecRow('Zanaat Standardı:', 'Tamamen El İşçiliği Sırlı Porselen', 522);
        }

        // Signature (Bottom Left)
        ctx.textAlign = 'left';
        ctx.font = 'bold 11px "Outfit", sans-serif';
        ctx.fillStyle = '#888';
        ctx.fillText('BAŞ ZANAATKAR', 200, 675);

        ctx.font = '38px "Sacramento", cursive';
        ctx.fillStyle = '#e07a5f';
        ctx.fillText('Onur Karaca', 200, 715);

        ctx.font = '600 13px "Outfit", sans-serif';
        ctx.fillStyle = '#2D1F1A';
        ctx.fillText('Karaca Studios & KupaHanem', 200, 745);

        // Wax Seal (Bottom Right)
        const sealX = 980;
        const sealY = 705;
        const sealGrad = ctx.createRadialGradient(sealX, sealY, 5, sealX, sealY, 40);
        sealGrad.addColorStop(0, '#e07a5f');
        sealGrad.addColorStop(1, '#c05a3f');
        
        ctx.fillStyle = sealGrad;
        ctx.beginPath();
        ctx.arc(sealX, sealY, 40, 0, Math.PI * 2);
        ctx.fill();

        // Inner dashed line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.arc(sealX, sealY, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Seal Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ARTISAN', sealX, sealY - 6);
        ctx.fillText('CERTIFIED', sealX, sealY + 6);

        // Download trigger
        const link = document.createElement('a');
        link.download = `kupahanem-zanaat-sertifikasi-${orderId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    if (printCertBtn) {
        printCertBtn.addEventListener('click', () => {
            playSoundEffect('success');
            const orderId = certSerialNumber ? certSerialNumber.textContent : 'KH-ZANAAT';
            downloadCertificateAsImage(orderId);
        });
    }

    const closeCertModal = () => {
        playSoundEffect('click');
        if (certificateModal) {
            certificateModal.classList.remove('open');
        }
    };

    if (certModalCloseBtn) {
        certModalCloseBtn.addEventListener('click', closeCertModal);
    }

    if (closeCertModalBtn) {
        closeCertModalBtn.addEventListener('click', closeCertModal);
    }

    if (certificateModal) {
        const certOverlay = certificateModal.querySelector('.modal-overlay');
        if (certOverlay) {
            certOverlay.addEventListener('click', closeCertModal);
        }
    }


    // --- Utility Methods ---
    function adjustColorBrightness(hex, percent) {
        let num = parseInt(hex.replace("#",""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R<255?R<0?0:R:255)*0x10000 + (G<255?G<0?0:G:255)*0x100 + (B<255?B<0?0:B:255)).toString(16).slice(1);
    }

    function isColorDark(hex) {
        const rgb = hexToRgb(hex);
        if (!rgb) return false;
        const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
        return yiq < 140; 
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // --- Font Loading Redraw ---
    if (document.fonts) {
        document.fonts.ready.then(() => {
            updateMugTexture();
        });
    }

    // --- Init ---
    renderShopCatalog();
    renderLayersList();
    renderCart();
    updateCartState();

});
