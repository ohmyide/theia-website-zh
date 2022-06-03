/********************************************************************************
 * Copyright (C) 2020 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import React from 'react'

import styled from '@emotion/styled'
import CompletionVideo from '../../resources/completion.mp4'
import TermianlVideo from '../../resources/terminal.mp4'
import LayoutVideo from '../../resources/layout.mp4'
import Promo from './Promo'

const StyledPromos = styled.div`
    .promos {
        margin: 15rem 0;
    }
`

const promos = [
    {
        title: "支持 JavaScript、 Java、 Python 等等",
        para: <p>
            Theia 建立在<a href="https://microsoft.github.io/language-server-protocol/" target="_blank" rel="noopener noreferrer">语言服务协议（LSP）</a>之上，
            受益于由<strong>60 多个可用的语言服务</strong>组成的生态系统，能够为所有主流编程语言提供智能编辑支持。
        </p>,
        videoSrc: CompletionVideo
    },
    {
        title: "终端集成",
        para: <p>Theia 集成了一个功能齐全的终端，可在浏览器重新加载时自动重连，保留完整的历史记录。</p>,
        videoSrc: TermianlVideo
    },
    {
        title: "弹性布局",
        para: <p>Theia 界面由轻量级的模块化 widget 组成，为拖拽停靠布局提供了坚实基础。</p>,
        videoSrc: LayoutVideo
    }
]

const Promos = () => (
    <StyledPromos>
        <section className="promos">
            <div className="row">
                { promos.map((promo, i) => <Promo key={i} {...promo} />) }
            </div>
        </section>
    </StyledPromos>
)

export default Promos