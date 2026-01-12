import discordUrl from "../../fonts/discord.svg";
import githubUrl from "../../fonts/github.svg";
import kofiIcon from "../../fonts/ko-fi-icon.svg";

import * as React from "react";
import styles from './info.module.css'

export function Info({className="", ...props}) {
    return (
        <div className={`${styles.info} ${className}`} >
            <h3>Morsechat</h3>
            <p>Bu, çevrimiçi bir morse kodu sohbetidir</p>
            <p>Nokta göndermek için boşluk tuşuna veya aşağıdaki tuşa basın, çizgi göndermek için basılı tutun
            </p>
            <p>
                Yardım almak veya geliştirmeye katılmak için discord topluluğuna katılın
            </p>
            <a href="https://discord.gg/JPzfzNJG6e" title="discord">
                <img src={discordUrl}/>
            </a><br/>
            <a href="https://github.com/robalb/morsechat" title="github">
                <img src={githubUrl}/>
            </a>
        </div>
    )
}
