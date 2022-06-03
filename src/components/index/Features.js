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
import { breakpoints } from '../../utils/variables'
import IconExtension from '../../resources/icon-extension.svg'
import IconCloudScreen from '../../resources/icon-cloud-screen.svg'
import IconOpenSource from '../../resources/icon-open-source.svg'
import Html from '../../resources/icon-html.svg'

import { Link } from 'gatsby'
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
        img: <img src={IconCloudScreen} alt="Cloud Screen" />,
        title: "云端 & 桌面端",
        paragraphs: ['纠结自己需要网页版还是桌面版？或者两者都要？','用 Theia 可以用一套代码产出浏览器和桌面两套 IDE。']
    },
    {
        img: <img src={IconExtension} alt="Icon Extension" />,
        title: "可扩展",
        paragraphs: ['Theia 采用模块化设计思路，各功能方向均支持自定义适配和扩展。', 
        <>
            这不仅仅是“增加扩展而已”，因为 Eclipse Theia 能让你构建出完全定制甚至属于自己品牌的产品！
        </>]
    },
    {
        img: <img src={IconOpenSource} alt="Vendor Neutral Open Source" />,
        title: "厂商中立",
        paragraphs: [ <>
            Theia 是真正的意义上的厂商中立，自身由多元化的技术社区开发。 与其他“开源”项目不同，Theia 托管在专门的开源基金会，从而免受单一供厂商的利益决策影响。
            想了解更多 <a href="https://www.eclipse.org/projects/dev_process/">请点击这里</a>。
        </>]
    },
    {
        img: <img src={Html} alt="Modern Tech" />,
        title: "技术前沿",
        paragraphs: ['Theia 基于最先进的 Web 的技术。 通过 LSP 和 DAP 提供语言支持。 此外，它还支持 VS Code 插件并提供完整的终端访问能力。']
    }
]

const Features = () => (
    <StyledFeatures>
        <section className="features" id="features">
            <div className="row feature__container">
                {features.map(
                    (feature, i) => <Feature key={`${i}+${feature.title}`} {...feature} />
                )}
            </div>
        </section>
    </StyledFeatures>
)

export default Features