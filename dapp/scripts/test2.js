const Contacts = artifacts.require("StudentListStorage.sol")

module.exports =async  function(callback){
    // console.log(111111)
    const studentStorage = await Contacts.deployed()

    await studentStorage.addList("kerwin",100)
    let res =await studentStorage.getList()
    console.log(res)
    console.log(await studentStorage.StudentList(1))
    
    callback()
}

