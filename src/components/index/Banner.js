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
import TheiaLogoEdited from '../../resources/theia-logo-edited.svg'


const StyledBanner = styled.div`
    .banner {
        margin-top: 5rem;
        display: flex;

        @media(max-width: ${breakpoints.md}) {
            flex-direction: column;
            margin-top: 5rem;
        }

        p {
            margin-bottom: 2rem;
        }

        li {
            margin-left: 2rem;
        }

        strong {
            font-weight: 500;
        }

        img {
            display: block;
            position: relative;
            top: 50%;
            transform: translateY(-50%);
            width: 100%;
        }

        div {
            width: 50%;
            max-width: 45rem;
            margin: 0 auto;

            @media(max-width: ${breakpoints.md}) {
                width: 100%;
                img {
                    margin: 0 auto 5rem;
                    height: 18rem;
                    transform: none;
                }
            }
        }

        h3 {
            @media(max-width: ${breakpoints.md}) {
                width: 100%;
                max-width: 60rem;
                margin-left: auto;
                margin-right: auto;
                text-align: center;
            }
        }
    }
`

const Banner = () => (
    <StyledBanner>
        <section className="row banner">
            <div>
                <img src={TheiaLogoEdited} alt="Theia Logo" />
            </div>
            <div>
                <h3 className="heading-tertiary">Theia 与 VS Code</h3>
                <p>我们同样相信 <strong>VS Code 是一款优秀的产品</strong>。 这也是 Theia 在设计理念上，甚至在插件上直接支持 VS Code 的原因。</p>
                <div style={{ width: '100%', margin: '2rem 0', maxWidth: 'auto' }}>最大的不同在于:
                                <ul>
                        <li><strong>Theia 架构更加模块化</strong> 允许更多的定制</li>
                        <li>Theia 从设计之初就<strong>天然支持桌面端和云端</strong></li>
                        <li>Theia 基于 <strong>厂商中立的开源基金会</strong>.</li>
                    </ul>
                </div>
            </div>
        </section>
    </StyledBanner>
)

export default Banner