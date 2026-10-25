document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Анимация бегущего счетчика на главной
    const counterElement = document.getElementById("memory-counter");
    if (counterElement) {
        const targetValue = 142;
        let currentValue = 0;
        const duration = 2000;
        const stepTime = Math.max(Math.floor(duration / targetValue), 10);
        
        const counterInterval = setInterval(() => {
            currentValue += 1;
            counterElement.textContent = currentValue;
            if (currentValue >= targetValue) {
                clearInterval(counterInterval);
            }
        }, stepTime);
    }

    // 2. Валидация и отправка формы
    const memoryForm = document.querySelector(".form-container form");
    if (memoryForm) {
        memoryForm.addEventListener("submit", (event) => {
            event.preventDefault();
            
            const userName = document.getElementById("user-name").value.trim();
            const heroName = document.getElementById("hero-name").value.trim();
            const heroStory = document.getElementById("hero-story").value.trim();

            if (heroStory.length < 20) {
                alert("Пожалуйста, опишите историю более подробно (минимум 20 символов).");
                return;
            }

            alert(`Уважаемый(ая) ${userName}!\n\nСпасибо за ваш вклад. История ветерана (${heroName}) успешно отправлена в архив.`);
            memoryForm.reset();
        });
    }

    // 3. Эффект плавного проявления карточек при открытии
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

            if (matchesSearch && matchesFilter) {
                card.classList.remove("hide");
            } else {
                card.classList.add("hide");
            }
        });
    }

    // Обработчик ввода текста в поисковую строку
    searchInput.addEventListener("input", filterArchive);

    // Обработчик клика по кнопкам категорий
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            filterArchive();
        });
    });
});