const SUPABASE_URL = 'https://svyaz-pokoleniy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_W4t0BG_nPd4DLM3SSnHViQ_b2h2Kw3m';

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

async function sendData(event) {
    if (event) event.preventDefault();

    const statusText = document.getElementById('formStatus');
    const userName = document.getElementById("user-name").value.trim();
    const heroName = document.getElementById("hero-name").value.trim();
    const heroStory = document.getElementById("hero-story").value.trim();

    if (heroStory.length < 20) {
        alert("Пожалуйста, опишите историю более подробно (минимум 20 символов).");
        return false;
    }

    if (!supabase) {
        if (statusText) {
            statusText.className = 'status-message status-error';
            statusText.innerText = "Ошибка подключения к базе данных. Проверьте скрипты.";
        }
        return false;
    }

    if (statusText) {
        statusText.className = 'status-message';
        statusText.style.color = '#2b2b2b';
        statusText.innerText = 'Отправка истории в архив...';
    }

    try {
        // 2. ИСПРАВЛЕНО: Добавлено is_published: true, чтобы счетчик видел новые записи
        const { data, error } = await supabase
            .from('stories')
            .insert([{ 
                user_name: userName, 
                hero_name: heroName, 
                hero_story: heroStory,
                is_published: true 
            }]);

        if (error) throw error;

        if (statusText) {
            statusText.className = 'status-message status-success';
            statusText.innerText = `Уважаемый(ая) ${userName}! Спасибо за ваш вклад. История ветерана (${heroName}) успешно отправлена в архив и будет опубликована после проверки.`;
        }
        
        document.getElementById("user-name").value = "";
        document.getElementById("hero-name").value = "";
        document.getElementById("hero-story").value = "";

    } catch (error) {
        console.error(error);
        if (statusText) {
            statusText.className = 'status-message status-error';
            statusText.innerText = "Произошла техническая ошибка при отправке: " + error.message;
        }
    }
    return false;
}

document.addEventListener("DOMContentLoaded", () => {
    const counterElement = document.getElementById("memory-counter");
    
    if (counterElement && supabase) {
        // Функция для обновления счетчика
        const updateCounter = () => {
            supabase
                .from('stories')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true)
                .then(({ count, error }) => {
                    if (error) { counterElement.textContent = "0"; return; }
                    const targetValue = count || 0;
                    let currentValue = 0;
                    if (targetValue === 0) { counterElement.textContent = "0"; return; }
                    
                    // Анимация
                    const duration = 2000;
                    const stepTime = Math.max(Math.floor(duration / targetValue), 10);
                    const counterInterval = setInterval(() => {
                        currentValue += 1;
                        counterElement.textContent = currentValue;
                        if (currentValue >= targetValue) clearInterval(counterInterval);
                    }, stepTime);
                });
        };

        // Запускаем счетчик при загрузке
        updateCounter();

        // 3. ДОБАВЛЕНО: Realtime - счетчик будет обновляться сам, если кто-то отправит анкету
        supabase.channel('stories-channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stories' }, (payload) => {
                console.log('Новая история добавлена!');
                updateCounter();
            })
            .subscribe();

    } else if (counterElement) {
        counterElement.textContent = "0";
    }

    // --- Ваши анимации карточек остаются без изменений ---
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.transition = "all 0.6s ease-out";
        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 150);
    });
});

// --- Ваш поиск и фильтры остаются без изменений ---
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("hero-search");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll("#heroes-grid .feature-card");
    if (!searchInput || cards.length === 0) return;

    function filterArchive() {
        const searchText = searchInput.value.toLowerCase().trim();
        const activeFilter = document.querySelector(".filter-btn.active").getAttribute("data-filter");
        cards.forEach(card => {
            const heroName = card.querySelector("h3").textContent.toLowerCase();
            const cardCategory = card.getAttribute("data-category");
            const matchesSearch = heroName.includes(searchText);
            const matchesFilter = (activeFilter === "all" || cardCategory === activeFilter);
            if (matchesSearch && matchesFilter) card.classList.remove("hide"); else card.classList.add("hide");
        });
    }
    searchInput.addEventListener("input", filterArchive);
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            filterArchive();
        });
    });
});
