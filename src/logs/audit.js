async function audit(database, data){
  await database.collection("audit_logs").insertOne({
    ...data,
    date: Date.now()
  });
}

module.exports = { audit };
