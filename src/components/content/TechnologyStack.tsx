import { Table } from "@heroui/react";
import React from "react";

const TechnologyStack = () => {
    return (
        <Table className="not-prose">
            <Table.Content aria-label="Technology stack">
                <Table.Header>
                    <Table.Column isRowHeader>Technology</Table.Column>
                    <Table.Column>Purpose</Table.Column>
                </Table.Header>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>
                            <strong>Astro</strong>
                        </Table.Cell>
                        <Table.Cell>
                            Static site generation for blazing-fast loads
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            <strong>React</strong>
                        </Table.Cell>
                        <Table.Cell>
                            Interactive components and state management
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            <strong>TypeScript</strong>
                        </Table.Cell>
                        <Table.Cell>Type-safe code for reliability</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            <strong>Nanostores</strong>
                        </Table.Cell>
                        <Table.Cell>Lightweight state management</Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            <strong>Recharts</strong>
                        </Table.Cell>
                        <Table.Cell>
                            Beautiful, responsive data visualizations
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            <strong>Cloudflare Pages</strong>
                        </Table.Cell>
                        <Table.Cell>
                            Global CDN for instant worldwide access
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table.Content>
        </Table>
    );
};

export default TechnologyStack;
