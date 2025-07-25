const modal = document.getElementById("nameModal");
const firstNameInput = document.getElementById("firstNameInput");
const lastNameInput = document.getElementById("lastNameInput");
const firstNameDisplay = document.getElementById("firstNameDisplay");
const lastNameDisplay = document.getElementById("lastNameDisplay");
const emailDisplay = document.getElementById("emailInput");

let firstName = localStorage.getItem("firstName") || "John";
let lastName = localStorage.getItem("lastName") || "Doe";
let email = "john.doe@gmail.com";

firstNameDisplay.textContent = firstName;
lastNameDisplay.textContent = lastName;

modal.style.display = "none";

const getMessages = async () => {
  const searchValue = document.querySelector("#emailSearchInput").value.trim();

  const usedEmail = searchValue || email;
  const fetchUrl = `http://146.185.154.90:8000/blog/${usedEmail}/posts`;

  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error("Ошибка загрузки сообщений");
    }

    const data = await response.json();
    renderPage(data);
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
};

const postMessage = async (message) => {
  const url = `http://146.185.154.90:8000/blog/${email}/posts`;
  const body = new URLSearchParams();
  body.append("message", message);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Ошибка при отправке сообщения: ${response.status}`);
    }
    document.getElementById("messageInput").value = "";
    await getMessages();
  } catch (error) {
    console.error(error.message);
  }
};

const renderPage = (data) => {
  const ul = document.getElementById("messageList");
  ul.innerHTML = "";

  data.reverse().forEach((sms) => {
    const li = document.createElement("li");
    li.innerHTML = `
          <div class="card mb-3 shadow-sm border-start border-primary border-4">
                <div class="card-body">
              <div class="d-flex justify-content-between">
               <div>
                  <h5 class="card-title mb-1">${sms.user.firstName} ${
      sms.user.lastName
    } пишет... </h5>
                  <h6 class="card-subtitle text-muted">${sms.user.email}</h6>
                </div>
                <small class="text-amuted">${new Date(
                  sms.datetime
                ).toLocaleString()}</small>
              </div>
              <hr>
              <p class="card-text fs-5">${sms.message}</p>
            </div>
          </div>
    `;
    ul.appendChild(li);
  });
};

const getProfile = async () => {
  const profileUrl = `http://146.185.154.90:8000/blog/${email}/profile`;
  try {
    const response = await fetch(profileUrl);
    if (!response.ok) {
      throw new Error("Ошибка загрузки профиля");
    }

    const data = await response.json();

    if (data.lastName === "Doe" && data.firstName === "John") {
      alert("Чтобы начать работу, вам нужно создать имя и фамилию");
    } else {
      await getMessages();
    }

    localStorage.setItem("firstName", data.firstName);
    localStorage.setItem("lastName", data.lastName);

    return data;
  } catch (error) {
    console.error("Ошибка при загрузке профиля:", error.message);
  }
};

const updateProfile = async () => {
  const url = `http://146.185.154.90:8000/blog/${email}/profile`;
  const body = new URLSearchParams();
  body.append("firstName", firstName);
  body.append("lastName", lastName);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    firstNameDisplay.textContent = firstName;
    lastNameDisplay.textContent = lastName;
    if (!response.ok) {
      throw new Error(`Ошибка обновления профиля: ${response.status}`);
    }
    console.log("Профиль обновлён");
  } catch (error) {
    console.error(error.message);
  }
};

document.getElementById("editName").addEventListener("click", async (e) => {
  e.preventDefault();
  firstNameInput.value = firstName;
  lastNameInput.value = lastName;
  modal.style.display = "block";
});

document.getElementById("messageList").addEventListener("click", async (e) => {
  if (e.target.classList.contains("deleteBtn")) {
    const postId = e.target.getAttribute("data-id");
    if (!postId) {
      console.error("Нет ID поста для удаления");
      return;
    }
    console.log("Удаляем пост с ID:", postId);
    await deletePost(postId);
  }
});

document.querySelector(".close").addEventListener("click", async (e) => {
  e.preventDefault();
  const textFirstName = firstNameInput.value.trim();
  const textLastName = lastNameInput.value.trim();

  if (textFirstName && textLastName) {
    firstName = textFirstName;
    lastName = textLastName;

    modal.style.display = "none";
    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
    await updateProfile();
    await getMessages();
  } else {
    alert("Пожалуйста, заполните все поля: Email, имя и фамилия");
  }
});

document.getElementById("messageForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = document.getElementById("messageInput").value.trim();
  if (message) {
    await postMessage(message);
  }
});

document.querySelector(".searchBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  await getMessages();
});

document.querySelector(".clear").addEventListener("click", async (e) => {
  document.querySelector("#emailSearchInput").value = "";
  await getMessages();
});

document.addEventListener("DOMContentLoaded", getProfile);
