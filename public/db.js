let db;

//request for the budget database
const request = indexedDB.open("budget", 1);

//creating an object store 'pending'
request.onupgradeneeded = function (event) {
	const db = event.target.result;
	db.createObjectStore("pending", { autoIncrement: true });
};

//make sure successful then check to see if app is running
request.onsuccess = function (event) {
	db = event.target.result;
	if (navigator.onLine) {
		checkDatabase();
	}
};

request.onerror = function (event) {
	console.log("Error! " + event.target.errorCode);
};

//for offline mode
function saveRecord(record) {
	//transaction object for using data via indexdb
	const transaction = db.transaction(["pending"], "readwrite");
	//pending object store
	const store = transaction.objectStore("pending");
	//add store
	store.add(record);
}

function checkDatabase() {
	const transaction = db.transaction(["pending"], "readwrite");
	const store = transaction.objectStore("pending");
	const getAll = store.getAll();

	//fetch & post
	getAll.onsuccess = function () {
		if (getAll.result.length > 0) {
			fetch("/api/transaction/bulk", {
				method: "POST",
				body: JSON.stringify(getAll.result),
				headers: {
					Accept: "application/json, text/plain, */*",
					"Content-Type": "application/json",
				},
			})
				//for response from JSON
				.then((response) => response.json())
				.then(() => {
					const transaction = db.transaction(["pending"], "readwrite");
					const store = transaction.objectStore("pending");
					store.clear();
				});
		}
	};
}

window.addEventListener("online", checkDatabase);
