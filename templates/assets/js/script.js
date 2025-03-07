'use strict';

// 元素切换功能
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// 侧边栏变量
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// 侧边栏移动端切换功能
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });


// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
// modalCloseBtn.addEventListener("click", testimonialsModalFunc);
// overlay.addEventListener("click", testimonialsModalFunc);



// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

// select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}

// 点赞功能
// 处理点赞按钮点击事件
const UpvoteManager = (group, plural) => {
	const STORAGE_KEY = `anatole.upvoted.${group}.names`;

	return {
		upvotedNames: [],
		init() {
			// 从 localStorage 中加载已点赞的名称
			this.upvotedNames = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
		},
		upvoted(name) {
			// 检查是否已经点赞
			return this.upvotedNames.includes(name);
		},
		async handleUpvote(name) {
			if (this.upvoted(name)) return; // 如果已经点赞，直接返回

			try {
				const response = await fetch("/apis/api.halo.run/v1alpha1/trackers/upvote", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						group,
						plural,
						name,
					}),
				});

				if (!response.ok) {
					throw new Error("网络请求失败");
				}

				// 更新本地存储和 UI
				this.upvotedNames = [...this.upvotedNames, name];
				localStorage.setItem(STORAGE_KEY, JSON.stringify(this.upvotedNames));

				const upvoteElement = document.querySelector(`[data="${name}"] span`);
				if (upvoteElement) {
					const currentCount = parseInt(upvoteElement.textContent || "0");
					upvoteElement.textContent = currentCount + 1;
				}
			} catch (error) {
				console.error("点赞失败:", error);
				alert("网络请求失败，请稍后再试");
			}
		},
	};
};

// 初始化点赞管理器
const momentUpvoteManager = UpvoteManager("moment.halo.run", "moments");
const postUpvoteManager = UpvoteManager("content.halo.run", "posts");
const pageUpvoteManager = UpvoteManager("content.halo.run", "singlepages");

momentUpvoteManager.init();
postUpvoteManager.init();
pageUpvoteManager.init();

// 绑定点赞按钮点击事件
document.addEventListener("DOMContentLoaded", () => {
	const likeButtons = document.querySelectorAll(".like-btn");

	likeButtons.forEach((button) => {
		button.addEventListener("click", (event) => {
			const name = button.getAttribute("data");
			const type = button.getAttribute("data-type"); // 获取点赞类型

			// 根据类型调用对应的点赞管理器
			if (type === "moment") {
				momentUpvoteManager.handleUpvote(name);
			} else if (type === "content") {
				postUpvoteManager.handleUpvote(name);
			} else if (type === "singlepages") {
				pageUpvoteManager.handleUpvote(name);
			}
		});
	});


    // 评论功能
    const commentButtons = document.querySelectorAll('.comment-btn');
    
    commentButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const momentName = this.dataset.moment;
            const commentsSection = document.getElementById(`comments-${momentName}`);
            
            // 切换评论区显示状态
            if (commentsSection.style.display === 'none') {
                commentsSection.style.display = 'block';
                this.classList.add('active');
            } else {
                commentsSection.style.display = 'none';
                this.classList.remove('active');
            }
        });
    });
});