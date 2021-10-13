const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'help',
    description: 'displays current commands and their funstionalities',
    async help(message){
        const helpMessageEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('List Of Useful Info And Commands Associated With Smoothy')
        .setDescription(`***Some Useful Information For Smoothy***
        :radio_button: Smoothy will occasianlly crash, if you notice it stopping music randomly or you enter a command with no response, please DM Eugene#3399 with conxtext of the crash any help is much appreciated!
        :radio_button: Smoothy will automatically disconnect from the VC in 30 minutes on Idle`)
        .addFields(
            { name: '***1: Play Command***', value: ':radio_button: ***-play*** or ***-p*** Will Make Smoothy ***Join The Voice Channel*** Then ***Play A Song.*** If A Song Is Currently Playing Then The Typed Song Is Added To The Queue' },
            { name: '***2: Skip Command***', value: ':radio_button: ***-skip, -s, -next,*** or ***-n*** Will ***Skip The Current Song*** And ***Play The Next Song*** In The Queue' },
            { name: '***3: Pause Command***', value: ':radio_button: ***-pause*** Will Pause The Servers Music'},
            { name: '***4: Resume Command***', value: ':radio_button: ***-resume*** Will Resume The Servers Music'},
            { name: '***5: Stop Command***', value: ':radio_button: ***-stop*** or ***-clear*** Will Make Smoothy ***Stop Playing*** And ***Clear The Queue***'},
            { name: '***6: Loop Song Command***', value: ':radio_button: ***-loopsong*** or ***-ls*** Will ***Loop*** The Current ***Song***, To Disable ***Loop Song*** Enter The Command Again'},
            { name: '***7: Loop Queue Command***', value: ':radio_button: ***-loopsong*** or ***-ls*** Will ***Loop*** The Current ***Queue***, To Disable ***Loop Queue*** Enter The Command Again'},
            { name: '***8: Queue Command***', value: ':radio_button: ***-queue*** or ***-list*** Will ***List*** Out The ***Current Queue*** With An ***Assigned Number*** 1,2,3 etc...'},
            { name: '***9: Remove Command***', value: ':radio_button: ***-remove*** or ***-r*** Will ***Remove A Song*** In The ***Queue*** With A ***Specified Number*** From The Queue List. You ***Cannot Remove*** The ***Current Song*** From The Queue'},
            { name: '***10: Leave Command***', value: ':radio_button: ***-leave, -disconnect, -dc*** or ***-die*** Will Make Smoothy ***Leave The Voice Channel*** And ***Clear The Queue***'},
        )
        message.reply({embeds: [helpMessageEmbed]})
    }
        
}
