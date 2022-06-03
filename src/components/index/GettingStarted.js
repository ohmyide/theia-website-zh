/********************************************************************************
 * Copyright (C) 2022 EclipseSource and others.
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
import { breakpoints } from '../../utils/variables'
import LearnMore from '../../resources/learn-more.svg'
import TryIt from '../../resources/try-it.svg'
import AdoptIt from '../../resources/download.svg'
import Contribute from '../../resources/contribute.svg'
import Feature from './Feature'

const StyledFeatures = styled.div`
    .features {
        padding: 1rem 0;
    }

    .feature__container {
        display: flex;

        @media(max-width: ${breakpoints.md}) {
            flex-direction: column;
        }
    }
`

const features = [
    {
        img: <img src={TryIt} alt="Try it" />,
        title: "快速尝试",
        paragraphs: [<>
        Theia 是一个构建 IDE 的框架，你可以尝试在几分钟内<a href="https://theia-ide.org/docs/composing_applications/">构建自己的 IDE 工具</a> 。 或者，你可以<a href="https://theia-ide.org/docs/blueprint_download/">下载试用 Theia Blueprint</a>，这是一个基于 Theia 构建的样板。
        </>]
    },
    {
        img: <img src={LearnMore} alt="Learn more" />,
        title: "了解更多",
        paragraphs: [<>
            通过以下资料了解更多 Theia： <a href="https://theia-ide.org/docs/getting_started/">怎样开始</a>， <a href="https://theia-ide.org/docs/composing_applications/">怎样构建自己的 IDE</a> 以及 <a href="https://theia-ide.org/docs/project_goals/">项目目标规划</a>。浏览 <a href="https://theia-ide.org/docs/">官方文档</a> 以及 <a href="https://theia-ide.org/resources/">相关资料</a>。 另外，还可查看下方视频了解更多。
        </>]
    },
    {
        img: <img src={AdoptIt} alt="Adopt it" />,
        title: "接入使用",
        paragraphs: [ <>
           查看 <a href="https://github.com/eclipse-theia/theia/releases">可用版本</a> 包括更新日志， 迁移指南以及新闻和有价值的文章。 浏览 <a href="https://github.com/eclipse-theia/theia">项目源码</a> 并从 <a href="https://www.npmjs.com/search?q=keywords:theia-extension">npm</a>安装 Theia 包。
        </>]
    },
    {
        img: <img src={Contribute} alt="Contribute" />,
        title: "欢迎贡献",
        paragraphs: [<>
        Theia 是由 Eclipse 基金会托管的开源项目。 我们欢迎你的贡献！ 请查看
        <a href="https://github.com/eclipse-theia/theia/blob/master/CONTRIBUTING.md">贡献指南</a>， 我们的 <a href="https://github.com/eclipse-theia/theia/blob/master/CODE_OF_CONDUCT.md">代码规范</a> 并从 <a href="https://github.com/eclipse-theia/theia/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22">一个好的 issues 开始</a>。
        </>]
    }
]

const GettingStarted = () => (
    <StyledFeatures>
        <section className="row features" id="gettingstarted">
            <h3 className="heading-tertiary">开始 Theia 之旅</h3>
            <div className="feature__container">
                {features.map(
                    (feature, i) => <Feature key={`${i}+${feature.title}`} {...feature} />
                )}
            </div>
        </section>
    </StyledFeatures>
)

export default GettingStarted
