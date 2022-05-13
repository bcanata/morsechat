import discordUrl from "../../fonts/discord.svg";
import githubUrl from "../../fonts/github.svg";
import * as React from "react";
import styles from './info.module.css'

export function Info({className="", ...props}) {
    return (
        <div className={`${styles.info} ${className}`} >
            <h3>Morsechat</h3>
            <p>This is a web-based morsecode chat</p>
            <p>Press space or the key below to transmit a dot, hold it to
                transmit a dash
            </p>
            <p>
                Join the discord community
                for help, or to participate on the development.
            </p>
            <h3>What's new</h3>
            <p>2022-13-05 update notes:</p>
            <p>- performance improvements</p>
            <p>- now you can mute individual users</p>
            <a href="https://discord.gg/JPzfzNJG6e" title="discord">
                <img src={discordUrl}/>
            </a><br/>
            <a href="https://github.com/robalb/morsechat" title="github">
                <img src={githubUrl}/>
            </a>
        </div>
    )
}